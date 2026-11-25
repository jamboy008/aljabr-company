// @vitest-environment node
import http from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createNextBffProxyHandler,
  validateInternalBackendUrl,
} from '../../src/lib/nextjsBffAdapter';
import { GET as getHealth } from '../../src/app/api/v1/health/route';
import { GET as getSystemConfig } from '../../src/app/api/v1/system/config/route';
import { GET as getAuthSession } from '../../src/app/api/v1/auth/session/route';

describe('Next.js BFF Route Handlers & Unconnected / Live Proxy Behavior', () => {
  const originalBackendEnv = process.env.FASTAPI_BACKEND_URL;

  afterAll(() => {
    process.env.FASTAPI_BACKEND_URL = originalBackendEnv;
  });

  it('rejects malformed or credentialed backend URLs and defaults to unconnected when empty', async () => {
    expect(validateInternalBackendUrl('')).toBeNull();
    expect(validateInternalBackendUrl('ftp://invalid-host')).toBeNull();
    expect(validateInternalBackendUrl('https://user:pass@backend.local')).toBeNull();
    expect(validateInternalBackendUrl('http://127.0.0.1:8000/')).toBe(
      'http://127.0.0.1:8000',
    );

    delete process.env.FASTAPI_BACKEND_URL;

    const healthRes = await getHealth();
    expect(healthRes.status).toBe(200);
    expect(await healthRes.json()).toEqual({
      status: 'ok',
      bff: 'v1',
      backendConfigured: false,
    });

    const configRes = await getSystemConfig();
    expect(configRes.status).toBe(200);
    const configJson = (await configRes.json()) as Record<string, unknown>;
    expect(configJson.apiMode).toBe('unconnected');
    expect(configJson.backendConfigured).toBe(false);
    expect(configJson.geminiConfigured).toBeUndefined();

    const sessionRes = await getAuthSession(
      new Request('http://localhost:3000/api/v1/auth/session'),
    );
    expect(sessionRes.status).toBe(200);
    const sessionJson = (await sessionRes.json()) as {
      authenticated: boolean;
      backendConfigured: boolean;
      user: unknown;
      apiMode: string;
    };
    expect(sessionJson.authenticated).toBe(false);
    expect(sessionJson.backendConfigured).toBe(false);
    expect(sessionJson.user).toBeNull();
    expect(sessionJson.apiMode).toBe('unconnected');
  });

  it('returns 503 BACKEND_NOT_CONNECTED when FASTAPI_BACKEND_URL is unset (no fake AI replies)', async () => {
    const handler = createNextBffProxyHandler({ fastApiBaseUrl: '' });

    const streamRes = await handler(
      new Request('http://localhost:3000/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      }),
    );
    expect(streamRes.status).toBe(503);
    const errJson = (await streamRes.json()) as { error: { code: string } };
    expect(errJson.error.code).toBe('BACKEND_NOT_CONNECTED');

    const restoreRes = await handler(
      new Request('http://localhost:3000/api/v1/auth/restore', {
        method: 'POST',
      }),
    );
    expect(restoreRes.status).toBe(503);
  });
});

describe('Next.js BFF Live Upstream Forwarding (FastAPI Integration Contract)', () => {
  let upstreamServer: http.Server;
  let upstreamBaseUrl = '';
  let capturedUserIdHeader: string | string[] | undefined;
  let capturedOrgHeader: string | string[] | undefined;
  let capturedBodyText = '';

  beforeAll(async () => {
    upstreamServer = http.createServer((req, res) => {
      capturedUserIdHeader = req.headers['x-aljabr-user-id'];
      capturedOrgHeader = req.headers['x-aljabr-org-id'];

      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        capturedBodyText = Buffer.concat(chunks).toString('utf8');

        if (req.url === '/api/v1/chat/stream') {
          res.writeHead(200, { 'Content-Type': 'text/event-stream' });
          res.write('event: meta\ndata: {"agentName":"FastAPI Agent","mode":"live"}\n\n');
          res.write('event: delta\ndata: {"text":"Real FastAPI stream"}\n\n');
          res.write('event: done\ndata: {"ok":true}\n\n');
          res.end();
          return;
        }

        if (req.url === '/api/v1/files/upload') {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              attachment: {
                id: 'att_upstream_1',
                fileName: 'audit.csv',
                extension: 'csv',
                mimeType: 'text/csv',
                sizeBytes: capturedBodyText.length,
                uploadedAt: '2026-11-25T00:00:00.000Z',
                status: 'ready',
                progress: 100,
              },
            }),
          );
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found', status: 404 } }));
      });
    });

    await new Promise<void>((resolve) => {
      upstreamServer.listen(0, '127.0.0.1', () => {
        const addr = upstreamServer.address();
        if (addr && typeof addr === 'object') {
          upstreamBaseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    upstreamServer.closeAllConnections?.();
    await new Promise<void>((resolve) => {
      upstreamServer.close(() => resolve());
    });
  });

  it('strips spoofed x-aljabr-user-id header and streams SSE + multipart file bytes intact to FastAPI', async () => {
    const handler = createNextBffProxyHandler({ fastApiBaseUrl: upstreamBaseUrl });

    // 1. Multipart file upload forwarding preserves actual file contents and strips spoofed user ID
    const form = new FormData();
    form.append('file', new Blob(['sku,qty\nALJ-101,55\n'], { type: 'text/csv' }), 'audit.csv');
    form.append('organizationId', 'org_tashkent_hq');

    const uploadRes = await handler(
      new Request('http://localhost:3000/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer f1_token_abc',
          'X-Aljabr-Org-Id': 'org_tashkent_hq',
          'X-Aljabr-User-Id': 'spoofed_admin',
        },
        body: form,
      }),
    );

    expect(uploadRes.status).toBe(201);
    expect(capturedUserIdHeader).toBeUndefined();
    expect(capturedOrgHeader).toBe('org_tashkent_hq');
    expect(capturedBodyText).toContain('ALJ-101,55');

    // 2. SSE stream passthrough
    const sseRes = await handler(
      new Request('http://localhost:3000/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Status' }),
      }),
    );
    expect(sseRes.status).toBe(200);
    const sseBody = await sseRes.text();
    expect(sseBody).toContain('Real FastAPI stream');
  });
});

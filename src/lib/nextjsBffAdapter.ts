/**
 * Next.js App Router BFF Proxy Adapter (Web Standards Request/Response).
 *
 * Pure passthrough proxy with zero mock AI answers or local auth bypass.
 * When FASTAPI_BACKEND_URL is unset, returns 503 BACKEND_NOT_CONNECTED.
 */

export interface NextBffProxyConfig {
  fastApiBaseUrl: string;
  requestTimeoutMs?: number;
}

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

export function validateInternalBackendUrl(rawUrl?: string | null): string | null {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function createNextBffProxyHandler(config: NextBffProxyConfig) {
  const validatedBase = validateInternalBackendUrl(config.fastApiBaseUrl);
  const timeoutMs = config.requestTimeoutMs ?? 45000;

  return async function proxyRequest(request: Request): Promise<Response> {
    if (!validatedBase) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'BACKEND_NOT_CONNECTED',
            message:
              'Business Backend API hali ulanmagan (.env faylida FASTAPI_BACKEND_URL manzilini sozlang).',
            status: 503,
          },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = `${validatedBase}${incomingUrl.pathname}${incomingUrl.search}`;

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    });

    // Never trust client-supplied identity spoofing headers when forwarding
    forwardHeaders.delete('x-aljabr-user-id');

    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const onIncomingAbort = () => controller.abort();
    request.signal.addEventListener('abort', onIncomingAbort, { once: true });

    try {
      const hasBody =
        request.method !== 'GET' &&
        request.method !== 'HEAD' &&
        request.body !== null;

      const upstreamInit: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers: forwardHeaders,
        signal: controller.signal,
      };
      if (hasBody) {
        upstreamInit.body = request.body;
        upstreamInit.duplex = 'half';
      }

      const upstream = await fetch(targetUrl, upstreamInit);

      const responseHeaders = new Headers();
      upstream.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      const isAborted =
        err instanceof DOMException
          ? err.name === 'AbortError'
          : err instanceof Error && err.name === 'AbortError';

      return new Response(
        JSON.stringify({
          error: {
            code: isAborted ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNREACHABLE',
            message: isAborted
              ? 'Business Backend request timed out or was cancelled.'
              : 'Unable to reach FastAPI Business Backend.',
            status: isAborted ? 504 : 502,
          },
        }),
        {
          status: isAborted ? 504 : 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener('abort', onIncomingAbort);
    }
  };
}

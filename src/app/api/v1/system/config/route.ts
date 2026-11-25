import { NextResponse } from 'next/server';
import { ALLOWED_EXTENSIONS, MAX_ATTACHMENT_SIZE_BYTES } from '@/src/lib/fileValidation';
import { validateInternalBackendUrl } from '@/src/lib/nextjsBffAdapter';
import type { SystemConfigResponse } from '@/src/types/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendConfigured = Boolean(
    validateInternalBackendUrl(process.env.FASTAPI_BACKEND_URL),
  );
  const frontend1LoginUrl = process.env.FRONTEND_1_LOGIN_URL?.trim() || '/';

  const payload: SystemConfigResponse = {
    apiMode: backendConfigured ? 'live' : 'unconnected',
    bffVersion: 'v1',
    backendConfigured,
    authProvider: 'frontend-1-sso',
    frontend1LoginUrl,
    allowedExtensions: [...ALLOWED_EXTENSIONS],
    maxFileSizeBytes: MAX_ATTACHMENT_SIZE_BYTES,
  };

  return NextResponse.json(payload);
}

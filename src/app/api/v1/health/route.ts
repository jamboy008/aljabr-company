import { NextResponse } from 'next/server';
import { validateInternalBackendUrl } from '@/src/lib/nextjsBffAdapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = validateInternalBackendUrl(process.env.FASTAPI_BACKEND_URL);
  return NextResponse.json({
    status: 'ok',
    bff: 'v1',
    backendConfigured: Boolean(backendUrl),
  });
}

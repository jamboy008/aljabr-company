import { createNextBffProxyHandler } from '@/src/lib/nextjsBffAdapter';

export const dynamic = 'force-dynamic';

function handleProxy(request: Request) {
  const handler = createNextBffProxyHandler({
    fastApiBaseUrl: process.env.FASTAPI_BACKEND_URL ?? '',
  });
  return handler(request);
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;

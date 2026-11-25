import { NextResponse } from 'next/server';
import {
  createNextBffProxyHandler,
  validateInternalBackendUrl,
} from '@/src/lib/nextjsBffAdapter';
import type { PlatformSession } from '@/src/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const fastApiUrl = validateInternalBackendUrl(process.env.FASTAPI_BACKEND_URL);
  const frontend1LoginUrl = process.env.FRONTEND_1_LOGIN_URL?.trim() || '/';

  if (fastApiUrl) {
    const handler = createNextBffProxyHandler({ fastApiBaseUrl: fastApiUrl });
    return handler(request);
  }

  // Unconnected state: never fabricate a demo user or fake SSO cookie
  const payload: PlatformSession = {
    authenticated: false,
    backendConfigured: false,
    user: null,
    organizations: [],
    activeOrganizationId: '',
    permissions: {
      canAccessCommandCenter: false,
      canUploadFiles: false,
      canViewTasks: false,
      canDecideTasks: false,
    },
    apiMode: 'unconnected',
    authProvider: 'frontend-1-sso',
    frontend1LoginUrl,
  };

  return NextResponse.json(payload);
}

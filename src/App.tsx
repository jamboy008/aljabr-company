'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { PlatformShell } from './components/PlatformShell';
import { TRANSLATIONS } from './i18n/translations';
import { apiClient } from './lib/apiClient';
import { clearAllSensitiveLocalData } from './lib/tenantStorage';
import {
  AiCommandCenterModule,
  type AiCommandCenterModuleHandle,
} from './modules/ai-command-center';
import type {
  Frontend1HostBridge,
  Locale,
  PlatformRoute,
  PlatformSession,
  ThemeMode,
} from './types/api';

declare global {
  interface Window {
    __ALJABR_FRONTEND_1_BRIDGE__?: Frontend1HostBridge;
  }
}

const THEME_STORAGE_KEY = 'aljabr_theme_v1';
const LOCALE_STORAGE_KEY = 'aljabr_locale_v1';

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage error
  }
  return 'light';
}

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'uz';
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'uz' || saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Ignore storage error
  }
  return 'uz';
}

const UNCONNECTED_SESSION: PlatformSession = {
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
  frontend1LoginUrl: '/',
};

export interface AppProps {
  /** Optional bridge injected when mounted inside Frontend 1 Next.js host */
  hostBridge?: Frontend1HostBridge;
}

export default function App({ hostBridge }: AppProps = {}) {
  const resolvedBridge =
    hostBridge ??
    (typeof window !== 'undefined'
      ? window.__ALJABR_FRONTEND_1_BRIDGE__
      : undefined);

  const [theme, setTheme] = useState<ThemeMode>(
    () => resolvedBridge?.theme ?? readInitialTheme(),
  );
  const [locale, setLocale] = useState<Locale>(
    () => resolvedBridge?.locale ?? readInitialLocale(),
  );
  const [activeRoute, setActiveRoute] = useState<PlatformRoute>('command-center');
  const moduleRef = useRef<AiCommandCenterModuleHandle | null>(null);

  const [session, setSession] = useState<PlatformSession>(
    resolvedBridge?.session ?? UNCONNECTED_SESSION,
  );
  const [sessionLoading, setSessionLoading] = useState<boolean>(
    !resolvedBridge?.session,
  );
  const [activeOrgId, setActiveOrgId] = useState<string>(
    resolvedBridge?.session?.activeOrganizationId ?? '',
  );

  const t = TRANSLATIONS[locale];

  // Sync in-memory access token if Frontend 1 host provides one (never localStorage)
  useEffect(() => {
    if (resolvedBridge?.accessToken !== undefined) {
      apiClient.setAccessToken(resolvedBridge.accessToken);
    }
  }, [resolvedBridge?.accessToken]);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage error
    }
  }, [locale]);

  // Verify session exclusively from Frontend 1 / BFF (/api/v1/auth/session).
  // ?embed query parameter is NEVER trusted to bypass authentication.
  useEffect(() => {
    if (resolvedBridge?.session) return;

    let cancelled = false;
    apiClient
      .getSession()
      .then((serverSession) => {
        if (cancelled) return;
        setSession(serverSession);
        setActiveOrgId(
          serverSession.activeOrganizationId ||
            serverSession.organizations[0]?.id ||
            '',
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSession(UNCONNECTED_SESSION);
          setActiveOrgId('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedBridge?.session]);

  const handleChangeOrganization = useCallback((orgId: string) => {
    setActiveOrgId(orgId);
  }, []);

  const handleSignOut = async () => {
    clearAllSensitiveLocalData();
    apiClient.setAccessToken(null);
    try {
      await apiClient.signOut();
    } catch {
      // Ignore network errors on signout
    }
    if (resolvedBridge?.onSignOut) {
      await resolvedBridge.onSignOut();
    }
    setSession((prev) => ({
      ...UNCONNECTED_SESSION,
      backendConfigured: prev.backendConfigured,
      apiMode: prev.apiMode,
      frontend1LoginUrl: prev.frontend1LoginUrl,
    }));
    setActiveOrgId('');
  };

  const activeOrganization = useMemo(() => {
    if (session.organizations.length === 0) return null;
    return (
      session.organizations.find((o) => o.id === activeOrgId) ??
      session.organizations[0]
    );
  }, [session.organizations, activeOrgId]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-navy-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-900 border-t-gold-500 dark:border-gold-400 dark:border-t-transparent" />
      </div>
    );
  }

  // When backend IS connected, strictly require authenticated Frontend 1 SSO session
  if (session.backendConfigured && (!session.authenticated || !session.user)) {
    const loginUrl = session.frontend1LoginUrl ?? '/';
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-navy-900 dark:text-slate-100">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-xs dark:border-navy-800 dark:bg-navy-950">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-900 ring-1 ring-gold-500/30 dark:bg-navy-900 dark:text-gold-400">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-lg font-bold text-navy-900 dark:text-white">
            {t.header.sessionRequiredTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.header.signedOutNotice}
          </p>
          {resolvedBridge?.onRequestAuth ? (
            <button
              type="button"
              onClick={resolvedBridge.onRequestAuth}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/40 bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 dark:border-gold-400/50 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t.header.signInViaFrontend1}</span>
            </button>
          ) : (
            <a
              href={loginUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/40 bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 dark:border-gold-400/50 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t.header.signInViaFrontend1}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <PlatformShell
      activeRoute={activeRoute}
      onNavigate={(route) => {
        setActiveRoute(route);
        resolvedBridge?.onNavigate?.(route);
      }}
      onNewChat={() => {
        setActiveRoute('command-center');
        moduleRef.current?.createNewChat();
      }}
      user={session.user}
      organizations={session.organizations}
      activeOrganizationId={activeOrganization?.id ?? ''}
      onChangeOrganization={handleChangeOrganization}
      apiMode={session.apiMode}
      locale={locale}
      onChangeLocale={setLocale}
      theme={theme}
      onToggleTheme={() =>
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
      }
      onSignOut={() => void handleSignOut()}
      t={t}
    >
      <AiCommandCenterModule
        actionsRef={moduleRef}
        session={session}
        activeRoute={activeRoute}
        activeOrganization={activeOrganization}
        locale={locale}
        theme={theme}
        onNavigate={(route) => {
          setActiveRoute(route);
          resolvedBridge?.onNavigate?.(route);
        }}
        onChangeLocale={onChangeLocale => setLocale(onChangeLocale)}
        onSetTheme={setTheme}
      />
    </PlatformShell>
  );
}

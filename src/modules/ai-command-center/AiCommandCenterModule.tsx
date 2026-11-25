'use client';

import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { AiTasksPage } from '../../components/AiTasksPage';
import { CommandCenterPage } from '../../components/CommandCenterPage';
import { OverviewPage } from '../../components/OverviewPage';
import { SettingsPage } from '../../components/SettingsPage';
import { TRANSLATIONS } from '../../i18n/translations';
import { apiClient } from '../../lib/apiClient';
import {
  clearAllSensitiveLocalData,
  loadTenantChats,
  purgeLegacyUnsafeStorage,
  saveTenantChats,
} from '../../lib/tenantStorage';
import type {
  AiTask,
  ChatMessage,
  ChatSession,
  Locale,
  Organization,
  PlatformRoute,
  PlatformSession,
  ThemeMode,
} from '../../types/api';

export interface AiCommandCenterModuleHandle {
  createNewChat: () => void;
}

export interface AiCommandCenterModuleProps {
  /** Verified session provided by Frontend 1 (Next.js host) or BFF /api/v1/auth/session */
  session: PlatformSession;
  activeRoute: PlatformRoute;
  activeOrganization: Organization | null;
  locale: Locale;
  theme: ThemeMode;
  onNavigate: (route: PlatformRoute) => void;
  onChangeLocale: (locale: Locale) => void;
  onSetTheme: (theme: ThemeMode) => void;
  actionsRef?: React.Ref<AiCommandCenterModuleHandle>;
}

/**
 * Unified Frontend 2 Module Entry Point for Frontend 1 (Next.js App Router).
 * Renders inside Frontend 1's shared Sidebar & Header without duplicating shell chrome.
 */
export const AiCommandCenterModule: React.FC<AiCommandCenterModuleProps> = ({
  session,
  activeRoute,
  activeOrganization,
  locale,
  theme,
  onNavigate,
  onChangeLocale,
  onSetTheme,
  actionsRef,
}) => {
  const userId = session.user?.id ?? '';
  const orgId = activeOrganization?.id ?? '';
  const t = TRANSLATIONS[locale];

  const [chats, setChats] = useState<ChatSession[]>(() => {
    purgeLegacyUnsafeStorage();
    if (!session.authenticated || !userId || !orgId) return [];
    return loadTenantChats(orgId, userId) ?? [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const persistChatsCache = useCallback(
    (targetOrgId: string, targetUserId: string, nextChats: ChatSession[]) => {
      if (!targetOrgId || !targetUserId) return;
      saveTenantChats(targetOrgId, targetUserId, nextChats);
    },
    [],
  );

  // Sync tenant-scoped chats from server BFF whenever verified org/user changes
  useEffect(() => {
    if (!session.authenticated || !userId || !orgId) {
      return;
    }
    let cancelled = false;

    apiClient
      .listChats(orgId, { organizationId: orgId })
      .then((res) => {
        if (cancelled) return;
        const cached = loadTenantChats(orgId, userId);
        const resolved =
          res.chats.length > 0
            ? res.chats
            : cached && cached.length > 0
              ? cached
              : [];
        setChats(resolved);
        setActiveChatId((prev) =>
          prev && resolved.some((c) => c.id === prev)
            ? prev
            : (resolved[0]?.id ?? null),
        );
        persistChatsCache(orgId, userId, resolved);
      })
      .catch(() => {
        if (cancelled) return;
        const cached = loadTenantChats(orgId, userId) ?? [];
        setChats(cached);
        setActiveChatId(cached[0]?.id ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, userId, session.authenticated, persistChatsCache]);

  const fetchTasksForOrg = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await apiClient.listTasks(orgId, { organizationId: orgId });
      setTasks(res.tasks);
    } catch (err) {
      setTasks([]);
      setTasksError(
        err instanceof Error ? err.message : 'Failed to load AI tasks.',
      );
    } finally {
      setTasksLoading(false);
    }
  }, [orgId]);

  // Fetch tenant-scoped AI tasks from BFF when backend is connected
  useEffect(() => {
    if (!session.backendConfigured || !session.authenticated || !orgId) {
      return;
    }
    let cancelled = false;

    apiClient
      .listTasks(orgId, { organizationId: orgId })
      .then((res) => {
        if (!cancelled) {
          setTasks(res.tasks);
          setTasksError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTasks([]);
          setTasksError(
            err instanceof Error ? err.message : 'Failed to load AI tasks.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, session.backendConfigured, session.authenticated]);

  const handleCreateChat = useCallback((): string => {
    const now = new Date().toISOString();
    const newId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `chat_${crypto.randomUUID()}`
        : `chat_${Math.random().toString(36).slice(2, 10)}`;

    const newChat: ChatSession = {
      id: newId,
      organizationId: orgId,
      userId,
      title: t.chat.newChat,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    setChats((prev) => {
      const next = [newChat, ...prev];
      if (session.authenticated) {
        persistChatsCache(orgId, userId, next);
      }
      return next;
    });
    setActiveChatId(newId);
    onNavigate('command-center');

    if (session.backendConfigured && session.authenticated && orgId) {
      void apiClient
        .createChat(
          { id: newId, organizationId: orgId, title: t.chat.newChat },
          { organizationId: orgId },
        )
        .then((res) => {
          setChats((prev) => {
            const next = prev.map((c) => (c.id === newId ? res.chat : c));
            persistChatsCache(orgId, userId, next);
            return next;
          });
          setActiveChatId((prevId) => (prevId === newId ? res.chat.id : prevId));
        })
        .catch(() => {
          // Keep draft chat in UI until backend connection responds
        });
    }

    return newId;
  }, [
    orgId,
    userId,
    session.authenticated,
    session.backendConfigured,
    persistChatsCache,
    onNavigate,
    t.chat.newChat,
  ]);

  useImperativeHandle(
    actionsRef,
    () => ({
      createNewChat: () => {
        handleCreateChat();
      },
    }),
    [handleCreateChat],
  );

  const handleRenameChat = useCallback(
    (chatId: string, title: string) => {
      setChats((prev) => {
        const next = prev.map((c) =>
          c.id === chatId
            ? { ...c, title, updatedAt: new Date().toISOString() }
            : c,
        );
        if (session.authenticated) {
          persistChatsCache(orgId, userId, next);
        }
        return next;
      });
      if (session.backendConfigured && session.authenticated && orgId) {
        void apiClient
          .renameChat(chatId, orgId, { title }, { organizationId: orgId })
          .catch(() => {});
      }
    },
    [orgId, userId, session.authenticated, session.backendConfigured, persistChatsCache],
  );

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== chatId);
        if (session.authenticated) {
          persistChatsCache(orgId, userId, next);
        }
        if (activeChatId === chatId) {
          setActiveChatId(next[0]?.id ?? null);
        }
        return next;
      });
      if (session.backendConfigured && session.authenticated && orgId) {
        void apiClient
          .deleteChat(chatId, orgId, { organizationId: orgId })
          .catch(() => {});
      }
    },
    [
      activeChatId,
      orgId,
      userId,
      session.authenticated,
      session.backendConfigured,
      persistChatsCache,
    ],
  );

  const handleUpdateChatMessages = useCallback(
    (
      chatId: string,
      updater: (prev: ChatMessage[]) => ChatMessage[],
      autoTitle?: string,
    ) => {
      setChats((prev) => {
        const next = prev.map((chat) => {
          if (chat.id !== chatId) return chat;
          return {
            ...chat,
            title: autoTitle ?? chat.title,
            updatedAt: new Date().toISOString(),
            messages: updater(chat.messages),
          };
        });
        if (session.authenticated) {
          persistChatsCache(orgId, userId, next);
        }
        return next;
      });
    },
    [orgId, userId, session.authenticated, persistChatsCache],
  );

  const handleTaskDecision = useCallback(
    async (taskId: string, decision: 'approve' | 'reject', note?: string) => {
      if (!userId || !orgId) return;
      const res = await apiClient.submitTaskDecision(
        taskId,
        { decision, note },
        { organizationId: orgId },
      );
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? res.task : task)),
      );
    },
    [orgId, userId],
  );

  if (activeRoute === 'overview') {
    return (
      <OverviewPage
        organization={activeOrganization}
        chats={chats}
        tasks={tasks}
        onNavigate={onNavigate}
        t={t}
      />
    );
  }

  if (activeRoute === 'tasks') {
    return (
      <AiTasksPage
        tasks={tasks}
        isLoading={tasksLoading}
        loadError={tasksError}
        canDecideTasks={session.permissions.canDecideTasks}
        onRetryLoad={() => void fetchTasksForOrg()}
        onTaskDecision={handleTaskDecision}
        t={t}
      />
    );
  }

  if (activeRoute === 'settings') {
    return (
      <SettingsPage
        apiMode={session.apiMode}
        locale={locale}
        onChangeLocale={onChangeLocale}
        theme={theme}
        onSetTheme={onSetTheme}
        onClearLocalCache={() => {
          clearAllSensitiveLocalData();
          if (!session.backendConfigured || !session.authenticated || !orgId) {
            setChats([]);
            setActiveChatId(null);
            return;
          }
          void apiClient
            .listChats(orgId, { organizationId: orgId })
            .then((res) => {
              setChats(res.chats);
              setActiveChatId(res.chats[0]?.id ?? null);
            })
            .catch(() => {
              setChats([]);
              setActiveChatId(null);
            });
        }}
        t={t}
      />
    );
  }

  return (
    <CommandCenterPage
      chats={chats}
      activeChatId={activeChatId}
      organizationId={orgId}
      locale={locale}
      apiMode={session.apiMode}
      canUploadFiles={session.backendConfigured ? session.permissions.canUploadFiles : true}
      t={t}
      onSelectChat={setActiveChatId}
      onCreateChat={handleCreateChat}
      onRenameChat={handleRenameChat}
      onDeleteChat={handleDeleteChat}
      onUpdateChatMessages={handleUpdateChatMessages}
    />
  );
};

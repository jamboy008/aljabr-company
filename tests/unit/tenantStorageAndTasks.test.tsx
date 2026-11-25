import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AiTasksPage } from '../../src/components/AiTasksPage';
import { SettingsPage } from '../../src/components/SettingsPage';
import { TRANSLATIONS } from '../../src/i18n/translations';
import {
  clearAllSensitiveLocalData,
  getTenantStorageKey,
  loadTenantChats,
  purgeLegacyUnsafeStorage,
  saveTenantChats,
} from '../../src/lib/tenantStorage';
import type { AiTask, ChatSession } from '../../src/types/api';

const TEST_TASKS_FIXTURE: AiTask[] = [
  {
    id: 'TSK-2041',
    organizationId: 'org_tashkent_hq',
    title: 'Ombor zaxirasi qayta buyurtma rejasini nashr etish',
    category: 'logistics',
    agentName: 'SupplyChain Agent',
    status: 'Awaiting Approval',
    startedAt: '2026-11-23T10:12:00.000Z',
    completedAt: null,
    summary: 'Q4 uchun 18 ta SKU jadvali.',
    resultDetail: 'Ichki omborlararo transfer jadvali tuzildi.',
    errorReason: null,
    requiresHumanApproval: true,
    approvalActionLabel: 'Ichki ombor ko‘chirish jadvalini tasdiqlash',
    steps: [{ label: 'ERP qoldiq ma’lumotlarini yig‘ish', completed: true, timestamp: '10:12:04' }],
  },
  {
    id: 'TSK-2040',
    organizationId: 'org_tashkent_hq',
    title: 'SLA shartnomasi muvofiqlik tahlili',
    category: 'compliance',
    agentName: 'Contract Analyst',
    status: 'Completed',
    startedAt: '2026-11-23T09:05:00.000Z',
    completedAt: '2026-11-23T09:07:42.000Z',
    summary: '24 betlik PDF tekshirildi.',
    resultDetail: 'SLA xulosa tayyor.',
    errorReason: null,
    requiresHumanApproval: false,
    approvalActionLabel: null,
    steps: [{ label: 'Yakuniy xulosani shakllantirish', completed: true, timestamp: '09:07:42' }],
  },
];

describe('Multi-Tenant Storage Isolation & Security Cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('scopes chats strictly by organizationId and userId and purges legacy cc_chats', () => {
    localStorage.setItem('cc_chats', JSON.stringify([{ id: 'legacy' }]));
    localStorage.setItem('aljabr_auth', JSON.stringify({ password: 'plain' }));
    purgeLegacyUnsafeStorage();

    expect(localStorage.getItem('cc_chats')).toBeNull();
    expect(localStorage.getItem('aljabr_auth')).toBeNull();

    const chatOrgA: ChatSession = {
      id: 'c_a',
      organizationId: 'org_a',
      userId: 'user_1',
      title: 'Org A Chat',
      createdAt: '2026-11-23T10:00:00.000Z',
      updatedAt: '2026-11-23T10:00:00.000Z',
      messages: [],
    };
    saveTenantChats('org_a', 'user_1', [chatOrgA]);

    expect(loadTenantChats('org_a', 'user_1')).toHaveLength(1);
    expect(loadTenantChats('org_b', 'user_1')).toBeNull();
    expect(getTenantStorageKey('org_a', 'user_1')).not.toBe('cc_chats');

    clearAllSensitiveLocalData();
    expect(loadTenantChats('org_a', 'user_1')).toBeNull();
  });
});

describe('AI Tasks Module & Operational Guardrails', () => {
  it('filters tasks by status and opens approval modal excluding financial payments', async () => {
    const onDecision = vi.fn().mockResolvedValue(undefined);
    const t = TRANSLATIONS.en;

    render(
      <AiTasksPage
        tasks={TEST_TASKS_FIXTURE}
        isLoading={false}
        loadError={null}
        onRetryLoad={() => {}}
        onTaskDecision={onDecision}
        t={t}
      />,
    );

    expect(screen.getByText('TSK-2041')).toBeInTheDocument();
    expect(
      screen.getByText(t.tasks.financialRestrictionNote),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Awaiting Approval' }));
    expect(screen.getByText('TSK-2041')).toBeInTheDocument();
    expect(screen.queryByText('TSK-2040')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => {
      expect(onDecision).toHaveBeenCalledWith('TSK-2041', 'approve', '');
    });
  });

  it('hides approval controls when server session grants read-only task permissions', () => {
    const t = TRANSLATIONS.en;
    render(
      <AiTasksPage
        tasks={TEST_TASKS_FIXTURE}
        isLoading={false}
        loadError={null}
        canDecideTasks={false}
        onRetryLoad={() => {}}
        onTaskDecision={vi.fn()}
        t={t}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Inspect' })[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.getByText(t.tasks.readOnlyNotice)).toBeInTheDocument();
  });
});

describe('Settings Security Policy', () => {
  it('does not expose any user-editable backend URL input', () => {
    const { container } = render(
      <SettingsPage
        apiMode="unconnected"
        locale="en"
        onChangeLocale={() => {}}
        theme="light"
        onSetTheme={() => {}}
        onClearLocalCache={() => {}}
        t={TRANSLATIONS.en}
      />,
    );

    expect(container.querySelectorAll('input')).toHaveLength(0);
    expect(screen.getByText('/api/v1')).toBeInTheDocument();
  });
});

export type Locale = 'uz' | 'en' | 'ru';
export type ThemeMode = 'light' | 'dark';
export type ApiMode = 'unconnected' | 'live';
export type PlatformRoute = 'overview' | 'command-center' | 'tasks' | 'settings';

export interface Organization {
  id: string;
  name: string;
  code: string;
  region: string;
}

export type PlatformUserRole =
  | 'Operations Lead'
  | 'Systems Analyst'
  | 'Workspace Admin';

export interface UserPermissions {
  canAccessCommandCenter: boolean;
  canUploadFiles: boolean;
  canViewTasks: boolean;
  canDecideTasks: boolean;
}

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: PlatformUserRole;
  avatarUrl: string;
}

export interface PlatformSession {
  authenticated: boolean;
  backendConfigured: boolean;
  user: PlatformUser | null;
  organizations: Organization[];
  activeOrganizationId: string;
  permissions: UserPermissions;
  apiMode: ApiMode;
  authProvider: 'frontend-1-sso';
  frontend1LoginUrl?: string;
}

export type AllowedFileExtension =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg';

export interface ChatAttachment {
  id: string;
  organizationId?: string;
  fileName: string;
  extension: AllowedFileExtension;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
  hasExtractedContent?: boolean;
  contentPreview?: string;
  downloadUrl?: string;
  uploadedAt: string;
  status: 'uploading' | 'ready' | 'error' | 'cancelled';
  progress: number;
  errorMessage?: string;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';
export type ChatMessageStatus = 'streaming' | 'completed' | 'stopped' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  attachments?: ChatAttachment[];
  errorMessage?: string;
  agentName?: string;
}

export interface ChatSession {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type ChatSortOrder = 'newest' | 'oldest';

export type TaskStatus =
  | 'Pending'
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Awaiting Approval';

export type TaskCategory =
  | 'operations'
  | 'compliance'
  | 'analytics'
  | 'hr'
  | 'logistics';

export interface AiTaskStep {
  label: string;
  completed: boolean;
  timestamp?: string;
}

export interface AiTask {
  id: string;
  organizationId: string;
  title: string;
  category: TaskCategory;
  agentName: string;
  status: TaskStatus;
  startedAt: string;
  completedAt: string | null;
  summary: string;
  resultDetail: string | null;
  errorReason: string | null;
  requiresHumanApproval: boolean;
  approvalActionLabel: string | null;
  approvalNote?: string;
  steps: AiTaskStep[];
}

export interface TaskDecisionRequest {
  decision: 'approve' | 'reject';
  note?: string;
}

export interface CreateChatRequest {
  id?: string;
  organizationId: string;
  title?: string;
}

export interface RenameChatRequest {
  title: string;
}

export interface ChatStreamRequest {
  chatId: string;
  organizationId: string;
  message: string;
  history: Array<{ role: ChatMessageRole; content: string }>;
  attachments: Array<
    Pick<ChatAttachment, 'id' | 'fileName' | 'extension' | 'sizeBytes' | 'sha256'>
  >;
  locale: Locale;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface SystemConfigResponse {
  apiMode: ApiMode;
  bffVersion: string;
  backendConfigured: boolean;
  authProvider: 'frontend-1-sso';
  frontend1LoginUrl: string;
  allowedExtensions: AllowedFileExtension[];
  maxFileSizeBytes: number;
}

export interface FilePreviewResponse {
  attachment: ChatAttachment;
  extractedText: string;
}

/**
 * Contract exposed for Frontend 1 (Next.js App Router host platform)
 * so AI Command Center & AI Tasks mount cleanly inside the shared layout.
 */
export interface Frontend1HostBridge {
  session?: PlatformSession;
  accessToken?: string | null;
  locale?: Locale;
  theme?: ThemeMode;
  onRequestAuth?: () => void;
  onSignOut?: () => Promise<void> | void;
  onNavigate?: (route: PlatformRoute) => void;
}

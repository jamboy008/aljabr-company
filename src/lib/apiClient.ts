import type {
  AiTask,
  ApiErrorResponse,
  ApiMode,
  ChatAttachment,
  ChatSession,
  ChatStreamRequest,
  CreateChatRequest,
  FilePreviewResponse,
  PlatformSession,
  RenameChatRequest,
  SystemConfigResponse,
  TaskDecisionRequest,
} from '../types/api';

const DEFAULT_TIMEOUT_MS = 15000;

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly isAborted: boolean;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    isAborted = false,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.isAborted = isAborted;
  }
}

export interface RequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  organizationId?: string;
}

export interface StreamCallbacks {
  onMeta?: (meta: { agentName: string; mode: ApiMode }) => void;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: ApiClientError) => void;
}

function mergeAbortSignals(
  externalSignal: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void; didTimeout: () => boolean } {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error('REQUEST_TIMEOUT'));
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      clearTimeout(timer);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    },
  };
}

class AljabrApiClient {
  // Always routed to same-origin BFF (/api/v1/*). Never user-overridable.
  private readonly basePath = '/api/v1';
  // Access token from Frontend 1 host is kept strictly in JS memory (never localStorage).
  private memoryAccessToken: string | null = null;

  public setAccessToken(token: string | null): void {
    this.memoryAccessToken = token && token.trim() ? token.trim() : null;
  }

  private buildHeaders(options?: RequestOptions, isJson = true): HeadersInit {
    const headers: Record<string, string> = {
      'X-Requested-With': 'ALJABR-Command-Center',
    };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.memoryAccessToken) {
      headers.Authorization = `Bearer ${this.memoryAccessToken}`;
    }
    if (options?.organizationId) {
      headers['X-Aljabr-Org-Id'] = options.organizationId;
    }
    return headers;
  }

  private async requestJson<T>(
    path: string,
    init: RequestInit,
    options?: RequestOptions,
  ): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const { signal, cleanup, didTimeout } = mergeAbortSignals(
      options?.signal,
      timeoutMs,
    );

    try {
      const response = await fetch(`${this.basePath}${path}`, {
        ...init,
        headers: {
          ...this.buildHeaders(options, true),
          ...(init.headers ?? {}),
        },
        credentials: 'same-origin',
        signal,
      });

      if (!response.ok) {
        let errorPayload: ApiErrorResponse | null = null;
        try {
          errorPayload = (await response.json()) as ApiErrorResponse;
        } catch {
          errorPayload = null;
        }

        throw new ApiClientError(
          errorPayload?.error?.message ?? `HTTP ${response.status}`,
          response.status,
          errorPayload?.error?.code ?? 'HTTP_ERROR',
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      if (
        (err instanceof DOMException || err instanceof Error) &&
        err.name === 'AbortError'
      ) {
        if (didTimeout()) {
          throw new ApiClientError('Request timed out', 408, 'TIMEOUT', false);
        }
        throw new ApiClientError('Request aborted', 499, 'ABORTED', true);
      }
      throw new ApiClientError(
        err instanceof Error ? err.message : 'Network error',
        0,
        'NETWORK_ERROR',
      );
    } finally {
      cleanup();
    }
  }

  public getSession(options?: RequestOptions): Promise<PlatformSession> {
    return this.requestJson<PlatformSession>(
      '/auth/session',
      { method: 'GET' },
      options,
    );
  }

  public signOut(options?: RequestOptions): Promise<{ ok: boolean }> {
    return this.requestJson<{ ok: boolean }>(
      '/auth/signout',
      { method: 'POST' },
      options,
    );
  }

  public getSystemConfig(options?: RequestOptions): Promise<SystemConfigResponse> {
    return this.requestJson<SystemConfigResponse>(
      '/system/config',
      { method: 'GET' },
      options,
    );
  }

  public listChats(
    organizationId: string,
    options?: RequestOptions,
  ): Promise<{ chats: ChatSession[]; mode: ApiMode }> {
    const query = new URLSearchParams({ organizationId });
    return this.requestJson<{ chats: ChatSession[]; mode: ApiMode }>(
      `/chats?${query.toString()}`,
      { method: 'GET' },
      { ...options, organizationId },
    );
  }

  public createChat(
    payload: CreateChatRequest,
    options?: RequestOptions,
  ): Promise<{ chat: ChatSession }> {
    return this.requestJson<{ chat: ChatSession }>(
      '/chats',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { ...options, organizationId: payload.organizationId },
    );
  }

  public renameChat(
    chatId: string,
    organizationId: string,
    payload: RenameChatRequest,
    options?: RequestOptions,
  ): Promise<{ chat: ChatSession }> {
    return this.requestJson<{ chat: ChatSession }>(
      `/chats/${encodeURIComponent(chatId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      { ...options, organizationId },
    );
  }

  public deleteChat(
    chatId: string,
    organizationId: string,
    options?: RequestOptions,
  ): Promise<{ ok: boolean }> {
    return this.requestJson<{ ok: boolean }>(
      `/chats/${encodeURIComponent(chatId)}`,
      { method: 'DELETE' },
      { ...options, organizationId },
    );
  }

  public listTasks(
    organizationId: string,
    options?: RequestOptions,
  ): Promise<{ tasks: AiTask[]; mode: ApiMode }> {
    const query = new URLSearchParams({ organizationId });
    return this.requestJson<{ tasks: AiTask[]; mode: ApiMode }>(
      `/tasks?${query.toString()}`,
      { method: 'GET' },
      { ...options, organizationId },
    );
  }

  public submitTaskDecision(
    taskId: string,
    payload: TaskDecisionRequest,
    options?: RequestOptions,
  ): Promise<{ task: AiTask }> {
    return this.requestJson<{ task: AiTask }>(
      `/tasks/${encodeURIComponent(taskId)}/decision`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options,
    );
  }

  public getFilePreview(
    attachmentId: string,
    organizationId: string,
    options?: RequestOptions,
  ): Promise<FilePreviewResponse> {
    return this.requestJson<FilePreviewResponse>(
      `/files/${encodeURIComponent(attachmentId)}/preview`,
      { method: 'GET' },
      { ...options, organizationId },
    );
  }

  public uploadAttachment(
    file: File,
    organizationId: string,
    onProgress: (percent: number) => void,
    options?: RequestOptions,
  ): Promise<ChatAttachment> {
    return new Promise<ChatAttachment>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeoutMs = options?.timeoutMs ?? 30000;
      xhr.open('POST', `${this.basePath}/files/upload`);
      xhr.withCredentials = true;
      xhr.timeout = timeoutMs;
      xhr.setRequestHeader('X-Requested-With', 'ALJABR-Command-Center');
      xhr.setRequestHeader('X-Aljabr-Org-Id', organizationId);
      if (this.memoryAccessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.memoryAccessToken}`);
      }

      const abortHandler = () => {
        xhr.abort();
      };

      if (options?.signal) {
        if (options.signal.aborted) {
          reject(new ApiClientError('Upload cancelled', 499, 'ABORTED', true));
          return;
        }
        options.signal.addEventListener('abort', abortHandler, { once: true });
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(95, Math.round((event.loaded / event.total) * 100));
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        options?.signal?.removeEventListener('abort', abortHandler);
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          try {
            const parsed = JSON.parse(xhr.responseText) as { attachment: ChatAttachment };
            resolve(parsed.attachment);
          } catch {
            reject(new ApiClientError('Invalid upload response', 500, 'PARSE_ERROR'));
          }
          return;
        }

        try {
          const errJson = JSON.parse(xhr.responseText) as ApiErrorResponse;
          reject(
            new ApiClientError(
              errJson.error?.message ?? `Upload failed (${xhr.status})`,
              xhr.status,
              errJson.error?.code ?? 'UPLOAD_ERROR',
            ),
          );
        } catch {
          reject(new ApiClientError(`Upload failed (${xhr.status})`, xhr.status, 'UPLOAD_ERROR'));
        }
      };

      xhr.onerror = () => {
        options?.signal?.removeEventListener('abort', abortHandler);
        reject(new ApiClientError('Network error during upload', 0, 'NETWORK_ERROR'));
      };

      xhr.ontimeout = () => {
        options?.signal?.removeEventListener('abort', abortHandler);
        reject(new ApiClientError('Upload timed out', 408, 'TIMEOUT'));
      };

      xhr.onabort = () => {
        options?.signal?.removeEventListener('abort', abortHandler);
        reject(new ApiClientError('Upload cancelled', 499, 'ABORTED', true));
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);
      xhr.send(formData);
    });
  }

  public async streamChat(
    payload: ChatStreamRequest,
    callbacks: StreamCallbacks,
    options?: RequestOptions,
  ): Promise<void> {
    const timeoutMs = options?.timeoutMs ?? 60000;
    const { signal, cleanup, didTimeout } = mergeAbortSignals(
      options?.signal,
      timeoutMs,
    );

    try {
      const response = await fetch(`${this.basePath}/chat/stream`, {
        method: 'POST',
        headers: this.buildHeaders(
          { ...options, organizationId: payload.organizationId },
          true,
        ),
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        let errorPayload: ApiErrorResponse | null = null;
        try {
          errorPayload = (await response.json()) as ApiErrorResponse;
        } catch {
          errorPayload = null;
        }
        throw new ApiClientError(
          errorPayload?.error?.message ?? `HTTP ${response.status}`,
          response.status,
          errorPayload?.error?.code ?? 'STREAM_HTTP_ERROR',
        );
      }

      if (!response.body) {
        throw new ApiClientError(
          'ReadableStream not supported by server response',
          500,
          'NO_STREAM',
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completed = false;

      const processBlock = (block: string) => {
        const lines = block.split(/\r?\n/);
        let eventType = 'message';
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        if (dataLines.length === 0) return;
        const rawData = dataLines.join('\n');

        if (eventType === 'meta') {
          try {
            const parsed = JSON.parse(rawData) as {
              agentName: string;
              mode: ApiMode;
            };
            callbacks.onMeta?.(parsed);
          } catch {
            // Ignore malformed metadata frame
          }
        } else if (eventType === 'delta') {
          try {
            const parsed = JSON.parse(rawData) as { text: string };
            if (typeof parsed.text === 'string') {
              callbacks.onDelta(parsed.text);
            }
          } catch {
            callbacks.onDelta(rawData);
          }
        } else if (eventType === 'error') {
          try {
            const parsed = JSON.parse(rawData) as { message?: string; code?: string };
            throw new ApiClientError(
              parsed.message ?? 'Streaming error',
              500,
              parsed.code ?? 'STREAM_ERROR',
            );
          } catch (err) {
            if (err instanceof ApiClientError) throw err;
            throw new ApiClientError('Streaming error', 500, 'STREAM_ERROR');
          }
        } else if (eventType === 'done') {
          completed = true;
          callbacks.onDone();
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? '';

        for (const block of blocks) {
          if (block.trim()) {
            processBlock(block);
          }
        }
      }

      if (buffer.trim()) {
        processBlock(buffer);
      }

      if (!completed) {
        callbacks.onDone();
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        callbacks.onError(err);
        return;
      }
      if (
        (err instanceof DOMException || err instanceof Error) &&
        err.name === 'AbortError'
      ) {
        if (didTimeout()) {
          callbacks.onError(new ApiClientError('Stream timed out', 408, 'TIMEOUT', false));
        } else {
          callbacks.onError(new ApiClientError('Stream stopped', 499, 'ABORTED', true));
        }
        return;
      }
      callbacks.onError(
        new ApiClientError(
          err instanceof Error ? err.message : 'Streaming connection interrupted',
          0,
          'NETWORK_ERROR',
        ),
      );
    } finally {
      cleanup();
    }
  }
}

export const apiClient = new AljabrApiClient();

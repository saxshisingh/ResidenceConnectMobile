import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';
import { AUTH_STORAGE_KEYS } from '../../auth/services/authService';

export interface InboxItem {
  conversationId: string;
  userId: string;
  userName: string;
  profilePhoto: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount?: number;
  totalUnSeenCount?: number;
}

export interface ChatAttachmentDto {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  duration?: number | null;
}

export interface ChatMessageDto {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  messageText: string | null;
  mediaPath: string | null;
  mediaType?: string | null;
  conversationId: string | null;
  status: number;
  createdAt: string;
  reaction?: string;
  attachments: ChatAttachmentDto[];
  localSendState?: 'sending' | 'sent' | 'failed';
}

export interface ChatUploadFile {
  uri: string;
  type: string;
  name: string;
}

const normalizeFileUrl = (path?: string | null) => {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return '';
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
  return `${API_BASE_URL}/${cleanPath.replace(/^\/+/, '')}`;
};

const normalizeAttachmentType = (type?: string | null): ChatAttachmentDto['type'] => {
  const value = String(type || '').toLowerCase();
  if (value.includes('image')) return 'image';
  if (value.includes('video')) return 'video';
  if (value.includes('audio')) return 'audio';
  return 'document';
};

const normalizeAttachment = (item: any): ChatAttachmentDto => ({
  id: String(item?.id || item?.Id || item?.attachmentId || `${Date.now()}-${Math.random()}`),
  name: String(item?.name || item?.Name || item?.fileName || item?.FileName || 'Attachment'),
  type: normalizeAttachmentType(item?.type || item?.Type || item?.mediaType || item?.MediaType),
  url: normalizeFileUrl(item?.url || item?.Url || item?.fileUrl || item?.FileUrl || item?.mediaPath || item?.MediaPath),
  duration: item?.duration ?? item?.Duration ?? null,
});

export const normalizeChatMessage = (item: any): ChatMessageDto => {
  const attachments = Array.isArray(item?.attachments)
    ? item.attachments.map(normalizeAttachment)
    : Array.isArray(item?.Attachments)
      ? item.Attachments.map(normalizeAttachment)
      : item?.mediaPath || item?.MediaPath
        ? [normalizeAttachment({
            id: item?.messageId || item?.MessageId,
            name: 'Attachment',
            type: item?.mediaType || item?.MediaType || 'document',
            url: item?.mediaPath || item?.MediaPath,
          })]
        : [];

  return {
    messageId: String(item?.messageId || item?.MessageId || ''),
    senderId: String(item?.senderId || item?.SenderId || ''),
    senderName: item?.senderName || item?.SenderName || null,
    messageText: item?.messageText ?? item?.MessageText ?? null,
    mediaPath: item?.mediaPath || item?.MediaPath || null,
    mediaType: item?.mediaType || item?.MediaType || null,
    conversationId: item?.conversationId || item?.ConversationId || null,
    status: Number(item?.status ?? item?.Status ?? 0),
    createdAt: String(item?.createdAt || item?.CreatedAt || new Date().toISOString()),
    reaction: item?.reaction,
    attachments,
    localSendState: undefined,
  };
};

export const extractMessageFromSendResponse = (payload: any): ChatMessageDto | null => {
  const candidate =
    payload?.data?.message ||
    payload?.data?.Message ||
    payload?.data ||
    payload?.message ||
    payload?.Message ||
    null;

  if (!candidate || (!candidate.messageId && !candidate.MessageId)) {
    return null;
  }

  return normalizeChatMessage(candidate);
};

const normalizeInboxItem = (item: any): InboxItem => {
  const unreadCount = Number(
    item?.unreadCount ??
      item?.UnreadCount ??
      item?.totalUnSeenCount ??
      item?.TotalUnSeenCount ??
      0,
  );

  return {
    conversationId: String(item?.conversationId || item?.ConversationId || ''),
    userId: String(item?.userId || item?.UserId || ''),
    userName: String(item?.userName || item?.UserName || ''),
    profilePhoto:
      normalizeFileUrl(item?.profilePhoto || item?.ProfilePhoto || '') || null,
    lastMessage: item?.lastMessage || item?.LastMessage || null,
    lastMessageAt: item?.lastMessageAt || item?.LastMessageAt || null,
    unreadCount,
    totalUnSeenCount: unreadCount,
  };
};

export const fetchInbox = async (): Promise<InboxItem[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/chat/inbox`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch inbox');
  }

  const json = await res.json();
  const rawInbox = Array.isArray(json?.data) ? json.data : [];
  return rawInbox.map(normalizeInboxItem);
};

export const fetchMessages = async (
  conversationId: string
): Promise<ChatMessageDto[]> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/chat/messages/${conversationId}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  const json = await res.json();
  const rawMessages = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  return rawMessages.map(normalizeChatMessage);
};

export const markChatMessageSeen = async (
  messageId: string,
  residentId: string,
) => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/chat/${messageId}/seen/${residentId}`,
    { method: 'POST' },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to mark message as seen');
  }

  const rawText = await res.text();
  const normalizedText = rawText.trim().toLowerCase();

  if (!normalizedText || normalizedText === 'seen') {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
};

export const sendMessageApi = async (
  receiverId: string,
  message?: string,
  files: ChatUploadFile[] = [],
) => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
  const formData = new FormData();

  formData.append('ReceiverId', receiverId);

  const cleanMessage = String(message || '').trim();
  if (cleanMessage) {
    formData.append('Message', cleanMessage);
  }

  files.forEach(file => {
    formData.append('Files', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
  });

  const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const text = await res.text();
  let json: any = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const trimmedText = text.trim();
    const isHtmlError = trimmedText.startsWith('<');
    const fallbackMessage =
      res.status === 413
        ? 'Attachment is too large. Please choose a smaller file.'
        : 'Failed to send message';

    throw new Error(
      json?.message ||
        json?.error ||
        (!isHtmlError ? trimmedText : '') ||
        fallbackMessage,
    );
  }

  if (json) {
    return json;
  }

  throw new Error('Chat send returned an invalid response.');
};

export const reactToMessageApi = async (
  messageId: string,
  reaction: string
) => {
  const res = await apiFetch(`${API_BASE_URL}/api/chat/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, reaction }),
  });

  return res.json();
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface TargetBlock {
  postId: string;
  blockId: string;
  blockName: string;
}

export interface Post {
  postId: string;
  postType: string;
  title: string;
  content: string;
  language: string;
  visibility: string;
  attachment: string | null;
  targetBlocks: TargetBlock[];
  status: number;
  publishAt: string;
  expiryAt: string;
  createdAt: string;
  createdBy: string;
  createdByRole: string;
  createdByName: string;
  createdByProfilePhoto: string | null;
  apartmentId: string | null;
  apartmentUnit: string | null;
  blockId: string | null;
  blockName: string | null;
  residenceId: string | null;
  residenceName: string | null;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  reportCount: number;
  isLikedByUser: boolean;
  isSavedByUser: boolean;
  isReportedByUser: boolean;
  safetyLevel: string;
}

export interface Comment {
  commentId: string;
  postId: string;
  commentText: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  createdByProfilePhoto: string | null;
  apartmentUnit: string | null;
  blockName: string | null;
  residenceName: string | null;
}

const asTrimmedString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
};

const buildFullName = (...parts: unknown[]) =>
  parts
    .filter(part => typeof part === 'string' || typeof part === 'number')
    .map(part => String(part).trim())
    .filter(Boolean)
    .join(' ')
    .trim();

const normalizeComment = (raw: any): Comment => {
  const nestedUser = raw?.user || raw?.createdByUser || raw?.author || raw?.resident || {};
  const nestedProfile = raw?.profile || raw?.createdByProfile || {};

  const createdByName =
    asTrimmedString(
      raw?.createdByName,
      raw?.commentedByName,
      raw?.userName,
      raw?.username,
      raw?.displayName,
      raw?.fullName,
      buildFullName(raw?.firstName, raw?.lastName),
      buildFullName(nestedUser?.firstName, nestedUser?.lastName),
      nestedUser?.fullName,
      nestedUser?.displayName,
      nestedUser?.userName,
      nestedUser?.username,
      raw?.createdBy,
      raw?.userId,
    ) || 'Unknown user';

  return {
    commentId: asTrimmedString(raw?.commentId, raw?.id),
    postId: asTrimmedString(raw?.postId),
    commentText: asTrimmedString(raw?.commentText, raw?.comment, raw?.text, raw?.content),
    createdAt: asTrimmedString(raw?.createdAt, raw?.commentedAt, raw?.updatedAt),
    createdBy: asTrimmedString(raw?.createdBy, raw?.userId, nestedUser?.userId),
    createdByName,
    createdByRole: asTrimmedString(
      raw?.createdByRole,
      raw?.roleName,
      raw?.role,
      nestedUser?.roleName,
      nestedUser?.role,
    ),
    createdByProfilePhoto: asTrimmedString(
      raw?.createdByProfilePhoto,
      raw?.profilePhoto,
      raw?.photo,
      nestedUser?.profilePhoto,
      nestedUser?.photo,
      nestedProfile?.profilePhoto,
    ) || null,
    apartmentUnit: asTrimmedString(
      raw?.apartmentUnit,
      raw?.unitNumber,
      raw?.flatNumber,
      nestedUser?.apartmentUnit,
    ) || null,
    blockName: asTrimmedString(raw?.blockName, nestedUser?.blockName) || null,
    residenceName: asTrimmedString(raw?.residenceName, nestedUser?.residenceName) || null,
  };
};

const resolveUserId = async (userId?: string): Promise<string> => {
  if (userId) return userId;

  const userRaw = await AsyncStorage.getItem('user');
  if (!userRaw) {
    throw new Error('User ID not found');
  }

  const parsed = JSON.parse(userRaw);
  const fallbackId = parsed?.data?.userId || parsed?.userId;
  if (!fallbackId) {
    throw new Error('User ID not found');
  }

  return String(fallbackId);
};

export const getPosts = async () => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(`${API_BASE_URL}/api/posts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  return json.data || [];
};



export const likePost = async (postId: string, userId?: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const resolvedUserId = await resolveUserId(userId);

  await apiFetch(`${API_BASE_URL}/api/posts/interactions/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId, userId: resolvedUserId }),
  });
};



export const savePost = async (postId: string, userId?: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const resolvedUserId = await resolveUserId(userId);

  await apiFetch(`${API_BASE_URL}/api/posts/interactions/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId, userId: resolvedUserId }),
  });
};



export const fetchComments = async (postId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/posts/interactions/comments/${postId}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const json = await res.json();
  return Array.isArray(json.data) ? json.data.map(normalizeComment) : [];
};

export const addComment = async (
  postId: string,
  commentText: string,
  userId?: string,
) => {
  const token = await AsyncStorage.getItem('authToken');
  const resolvedUserId = await resolveUserId(userId);

  
  const payload = {
    postId,
    userId: resolvedUserId,
    commentText,
    status: '2',
  };

  
  console.log('🚀 Sending Comment Payload:', payload);

  await apiFetch(`${API_BASE_URL}/api/posts/interactions/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload), // Pass the variable here
  });
};

export const createPost = async (formData: FormData) => {
  const token = await AsyncStorage.getItem('authToken');

  console.log("formData",formData)
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    console.error(' Create post failed:', json);
    throw new Error(json?.message || 'Create post failed');
  }

  return json;
};



export const reportPost = async (
  postId: string,
  reason: string,
  reportedBy: string,
) => {
  const token = await AsyncStorage.getItem('authToken');

  await apiFetch(`${API_BASE_URL}/api/posts/report`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId,
      reason,
      reportedBy,
    }),
  });
};

export const deletePost = async (postId: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const normalizedPostId = String(postId || '').trim();

  if (!normalizedPostId) {
    throw new Error('Post ID is required');
  }

  const res = await apiFetch(`${API_BASE_URL}/api/posts/${normalizedPostId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to delete post');
  }
};



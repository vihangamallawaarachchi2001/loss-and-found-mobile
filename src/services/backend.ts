import { AxiosError } from 'axios';

import {
  BackendOwnerAlert,
  CreateReportInput,
  ItemReport,
  ItemType,
  OwnerDecision,
  UserProfile,
} from '../domain/types';
import { api } from './api';

type AuthResponse = {
  userId: string;
  email: string;
  fullName: string;
  token: string;
};

type ProfileResponse = {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  avatarPath: string;
};

type ItemDto = {
  id: string;
  userId: string;
  itemType: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  status: 'active' | 'closed' | 'claimed';
  imagePaths: string[];
  textScore: number;
  imageScore: number;
  confidence: number;
  createdAt: string;
};

type ListItemsResponse = {
  items: ItemDto[];
  total: number;
};

type OperationResult = {
  success: boolean;
  message: string;
};

const normalizeError = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { error?: string } | undefined)?.error ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const toTimestamp = (raw: string): number => {
  const value = Date.parse(raw);
  return Number.isNaN(value) ? Date.now() : value;
};

const toReporterEmail = (userId: string): string => {
  return `user-${userId.slice(0, 8)}@lostfound.local`;
};

const toAbsoluteImageUrl = (rawPath?: string): string | undefined => {
  if (!rawPath) {
    return undefined;
  }

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  const base = (api.defaults.baseURL ?? '').replace(/\/$/, '');
  const path = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  return base ? `${base}/${path}` : rawPath;
};

export const mapItemDtoToReport = (item: ItemDto): ItemReport => ({
  id: item.id,
  type: item.itemType,
  title: item.title,
  description: item.description,
  location: item.location,
  eventAt: item.eventDate,
  imageUri: toAbsoluteImageUrl(item.imagePaths[0]),
  status: item.status === 'closed' ? 'claimed' : item.status,
  reporter: {
    id: item.userId,
    email: toReporterEmail(item.userId),
    fullName: item.userId,
    phone: '',
  },
  createdAt: toTimestamp(item.createdAt),
});

export async function login(email: string, password: string): Promise<UserProfile> {
  try {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', { email, password });
    return {
      id: response.data.userId,
      email: response.data.email,
      fullName: response.data.fullName,
      phone: '',
      token: response.data.token,
    };
  } catch (error) {
    throw new Error(normalizeError(error, 'Login failed'));
  }
}

export async function signup(fullName: string, email: string, password: string): Promise<void> {
  try {
    await api.post('/api/v1/auth/signup', { fullName, email, password });
  } catch (error) {
    throw new Error(normalizeError(error, 'Signup failed'));
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await api.post('/api/v1/auth/forgot-password', { email });
  } catch (error) {
    throw new Error(normalizeError(error, 'Could not send reset code'));
  }
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  try {
    await api.post('/api/v1/auth/reset-password', { email, otp, newPassword });
  } catch (error) {
    throw new Error(normalizeError(error, 'Could not reset password'));
  }
}

export async function listItems(type: ItemType, limit = 100): Promise<ItemReport[]> {
  try {
    const path = type === 'lost' ? '/api/v1/items/lost' : '/api/v1/items/found';
    const response = await api.get<ListItemsResponse>(path, { params: { limit, offset: 0 } });
    return response.data.items.map(mapItemDtoToReport);
  } catch (error) {
    throw new Error(normalizeError(error, `Could not load ${type} items`));
  }
}

export async function createItem(type: ItemType, userId: string, payload: CreateReportInput): Promise<ItemReport> {
  try {
    const path = type === 'lost' ? '/api/v1/items/lost' : '/api/v1/items/found';
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('category', 'other');
    formData.append('location', payload.location);
    formData.append('eventDate', payload.eventAt);

    if (payload.imageUri) {
      formData.append('photos', {
        uri: payload.imageUri,
        name: 'report-image.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const response = await api.post<ItemDto>(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return mapItemDtoToReport(response.data);
  } catch (error) {
    throw new Error(normalizeError(error, `Could not create ${type} report`));
  }
}

export async function getProfile(userId: string): Promise<Partial<UserProfile>> {
  try {
    const response = await api.get<ProfileResponse>('/api/v1/profile/me', { params: { userId } });
    return {
      id: response.data.userId,
      email: response.data.email,
      fullName: response.data.fullName,
      phone: response.data.phone,
    };
  } catch (error) {
    throw new Error(normalizeError(error, 'Could not load profile'));
  }
}

export async function updateProfile(userId: string, fullName: string, phone: string): Promise<Partial<UserProfile>> {
  try {
    const response = await api.put<ProfileResponse>(
      '/api/v1/profile/me',
      { fullName, phone, avatarPath: '' },
      { params: { userId } },
    );

    return {
      id: response.data.userId,
      email: response.data.email,
      fullName: response.data.fullName,
      phone: response.data.phone,
    };
  } catch (error) {
    throw new Error(normalizeError(error, 'Could not update profile'));
  }
}

export async function listOwnerAlerts(ownerUserId: string): Promise<BackendOwnerAlert[]> {
  try {
    const response = await api.get<BackendOwnerAlert[]>('/api/v1/matches/owner-alerts', {
      params: { ownerUserId },
    });

    return response.data;
  } catch (error) {
    throw new Error(normalizeError(error, 'Could not load owner alerts'));
  }
}

export async function submitMatchDecision(
  action: 'accept' | 'reject' | 'claim',
  lostId: string,
  foundId: string,
  decidedByUserId: string,
): Promise<OperationResult> {
  try {
    const response = await api.post<OperationResult>(`/api/v1/matches/${lostId}/${foundId}/${action}`, {
      decidedByUserId,
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeError(error, `Could not ${action} match`));
  }
}

export const toDecisionStatus = (status: OwnerDecision): OwnerDecision => status;

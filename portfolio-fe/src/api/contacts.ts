import type {
    ContactCreatedResponse,
    ContactRequest,
    ContactResponse,
    PageResponse,
} from '../types';
import { del, get, patch, post, qs } from './client';

// Công khai
export const sendContact = (data: ContactRequest) =>
    post<ContactCreatedResponse>('/api/contacts', data);

// Admin
export interface ContactListParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
    unread?: boolean;
}

export const getContacts = (params: ContactListParams = {}) =>
    get<PageResponse<ContactResponse>>(
        `/api/admin/contacts${qs({
            page: params.page ?? 0,
            size: params.size ?? 20,
            sortBy: params.sortBy ?? 'createdAt',
            direction: params.direction ?? 'desc',
            unread: params.unread ? true : undefined,
        })}`,
    );

export const getUnreadCount = () =>
    get<{ count: number }>('/api/admin/contacts/unread-count');

export const markContactRead = (id: number) =>
    patch<ContactResponse>(`/api/admin/contacts/${id}/read`);

export const deleteContact = (id: number) => del(`/api/admin/contacts/${id}`);

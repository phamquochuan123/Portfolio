import type { MediaResponse } from '../types';
import { del, get, postForm, qs } from './client';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function uploadMedia(file: File, opts: { projectId?: number; altText?: string } = {}) {
    const form = new FormData();
    form.append('file', file);
    return postForm<MediaResponse>(
        `/api/admin/media${qs({ projectId: opts.projectId, altText: opts.altText })}`,
        form,
    );
}

export const getMediaByProject = (projectId: number) =>
    get<MediaResponse[]>(`/api/admin/media/project/${projectId}`);

export const deleteMedia = (id: number) => del(`/api/admin/media/${id}`);

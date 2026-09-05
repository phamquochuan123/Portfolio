import type { ProjectDetail, ProjectRequest, ProjectSummary } from '../types';
import { del, get, post, put } from './client';

// Công khai — chỉ trả về project PUBLISHED
export const getProjects = () => get<ProjectSummary[]>('/api/projects');

export const getProjectBySlug = (slug: string) =>
    get<ProjectDetail>(`/api/projects/${encodeURIComponent(slug)}`);

// Admin — gồm cả DRAFT / PUBLISHED / ARCHIVED
export const getAdminProjects = () => get<ProjectDetail[]>('/api/admin/projects');

export const createProject = (data: ProjectRequest) =>
    post<ProjectDetail>('/api/admin/projects', data);

export const updateProject = (id: number, data: ProjectRequest) =>
    put<ProjectDetail>(`/api/admin/projects/${id}`, data);

export const deleteProject = (id: number) => del(`/api/admin/projects/${id}`);

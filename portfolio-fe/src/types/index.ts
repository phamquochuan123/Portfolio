export type ProjectStatus = 'DRAFT' | 'PUBLISHED';

export interface ProjectSummary {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    thumbnailUrl: string | null;
    publishedAt: string | null;
}

export interface ProjectDetail {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    content: string | null;
    thumbnailUrl: string | null;
    demoUrl: string | null;
    repoUrl: string | null;
    status: ProjectStatus;
    viewCount: number;
    publishedAt: string | null;
}

export interface ApiError {
    status: number;
    code: string;
    message: string;
    timestamp: string;
}
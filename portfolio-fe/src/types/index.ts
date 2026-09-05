export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Role = 'ADMIN' | 'USER';

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

export interface ProjectRequest {
    title: string;
    slug: string;
    summary: string;
    content: string;
    thumbnailUrl: string;
    demoUrl: string;
    repoUrl: string;
    status: ProjectStatus;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    /**
     * Thời gian sống của token, tính bằng GIÂY (không phải mili giây).
     * Backend: JwtService.getExpirationSeconds() = app.jwt.expiration-ms / 1000 = 3600.
     */
    expiresIn: number;
    email: string;
    fullName: string;
    role: Role;
}

export interface ContactRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactCreatedResponse {
    id: number;
    message: string;
}

export interface ContactResponse {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface MediaResponse {
    id: number;
    url: string;
    thumbnailUrl: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    altText: string | null;
    sortOrder: number;
    projectId: number | null;
}

export interface PageResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface TopProject {
    id: number;
    title: string;
    slug: string;
    viewCount: number;
}

export interface DailyCount {
    /** "YYYY-MM-DD" */
    date: string;
    count: number;
}

export interface StatsResponse {
    projectsTotal: number;
    projectsPublished: number;
    projectsDraft: number;
    projectsArchived: number;
    totalViews: number;
    contactsTotal: number;
    contactsUnread: number;
    topProjects: TopProject[];
    contactsPerDay: DailyCount[];
}

/** Thân JSON của mọi lỗi backend trả về. */
export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
    timestamp: string;
}

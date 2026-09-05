import type { ApiErrorBody } from '../types';
import { clearAuth, getAccessToken, setAuthNotice } from '../lib/authStorage';

const BASE = import.meta.env.VITE_API_URL;

const LOGIN_PATH = '/admin/login';

/** Lỗi có kèm status HTTP và mã lỗi backend, để chỗ gọi phân biệt được ngữ cảnh. */
export class ApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }

    /** So mã lỗi không phân biệt hoa thường (backend viết hoa lẫn lộn, vd File_TOO_LARGE). */
    is(code: string): boolean {
        return this.code.toLowerCase() === code.toLowerCase();
    }
}

export function isApiError(e: unknown): e is ApiError {
    return e instanceof ApiError;
}

function defaultMessage(status: number): string {
    if (status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 404) return 'Không tìm thấy dữ liệu.';
    if (status === 413) return 'Tệp quá lớn.';
    if (status === 429) return 'Bạn gửi hơi nhiều, thử lại sau ít phút.';
    if (status >= 500) return 'Máy chủ đang gặp sự cố, vui lòng thử lại sau.';
    return `Lỗi ${status}`;
}

function onUnauthorized(path: string): void {
    // Chỉ đá về trang đăng nhập khi đó là request của khu quản trị.
    // 401 từ một endpoint công khai là lỗi cấu hình phía server — khi đó phải để trang
    // đang mở tự hiện lỗi, tuyệt đối không ném khách vãng lai vào màn hình đăng nhập admin.
    if (!path.startsWith('/api/admin/')) return;
    clearAuth();
    if (window.location.pathname !== LOGIN_PATH) {
        setAuthNotice('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        window.location.assign(LOGIN_PATH);
    }
}

async function parseError(res: Response, path: string): Promise<ApiError> {
    let body: Partial<ApiErrorBody> | null = null;
    try {
        body = (await res.json()) as Partial<ApiErrorBody>;
    } catch {
        /* 401/403 từ security filter không có thân JSON */
    }
    if (res.status === 401) onUnauthorized(path);
    return new ApiError(
        res.status,
        body?.code ?? `HTTP_${res.status}`,
        body?.message ?? defaultMessage(res.status),
    );
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);

    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    // Với FormData phải để trình duyệt tự sinh Content-Type kèm boundary.
    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    let res: Response;
    try {
        res = await fetch(`${BASE}${path}`, { ...init, headers });
    } catch {
        throw new ApiError(0, 'NETWORK_ERROR', 'Không kết nối được máy chủ. Kiểm tra lại mạng rồi thử lại.');
    }

    if (!res.ok) throw await parseError(res, path);

    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
        return undefined as T;
    }
    return (await res.json()) as T;
}

export function get<T>(path: string): Promise<T> {
    return request<T>(path);
}

export function post<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) });
}

export function put<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(data ?? {}) });
}

export function patch<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, data === undefined
        ? { method: 'PATCH' }
        : { method: 'PATCH', body: JSON.stringify(data) });
}

export function del<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
}

export function postForm<T>(path: string, form: FormData): Promise<T> {
    return request<T>(path, { method: 'POST', body: form });
}

/** Ghép query string, bỏ qua các tham số undefined/null. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) search.set(key, String(value));
    }
    const str = search.toString();
    return str ? `?${str}` : '';
}

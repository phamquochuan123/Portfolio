import type { Role } from '../types';

export const AUTH_STORAGE_KEY = 'portfolio.auth';
export const AUTH_NOTICE_KEY = 'portfolio.authNotice';

export interface StoredAuth {
    accessToken: string;
    email: string;
    fullName: string;
    role: Role;
    /** Mốc hết hạn tuyệt đối (epoch ms). */
    expiresAt: number;
}

function isStoredAuth(value: unknown): value is StoredAuth {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.accessToken === 'string' &&
        typeof v.email === 'string' &&
        typeof v.fullName === 'string' &&
        typeof v.role === 'string' &&
        typeof v.expiresAt === 'number'
    );
}

/** Đọc phiên đăng nhập. Trả về null nếu chưa có, hỏng, hoặc đã quá hạn. */
export function readAuth(): StoredAuth | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
        return null;
    }
    if (!raw) return null;

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        clearAuth();
        return null;
    }

    if (!isStoredAuth(parsed)) {
        clearAuth();
        return null;
    }
    if (parsed.expiresAt <= Date.now()) {
        clearAuth();
        return null;
    }
    return parsed;
}

export function writeAuth(auth: StoredAuth): void {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
        /* localStorage bị chặn — bỏ qua, phiên chỉ sống trong bộ nhớ */
    }
}

export function clearAuth(): void {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        /* bỏ qua */
    }
}

export function getAccessToken(): string | null {
    return readAuth()?.accessToken ?? null;
}

/**
 * null = chưa đọc lần nào kể từ khi có thông báo mới.
 * Bọc trong object để phân biệt "chưa đọc" với "đã đọc, không có gì".
 */
let noticeCache: { value: string | null } | null = null;

/** Ghi lại một thông báo để trang đăng nhập hiển thị sau khi điều hướng. */
export function setAuthNotice(message: string): void {
    noticeCache = null;
    try {
        sessionStorage.setItem(AUTH_NOTICE_KEY, message);
    } catch {
        noticeCache = { value: message };
    }
}

/**
 * Đọc thông báo và xoá khỏi sessionStorage.
 * Kết quả được nhớ tạm nên gọi nhiều lần trong cùng một lần render vẫn ra một giá trị
 * (React StrictMode gọi initializer của useState hai lần). Gọi clearAuthNotice() khi
 * đã hiển thị xong, nếu không lần mở trang đăng nhập sau sẽ thấy lại thông báo cũ.
 */
export function takeAuthNotice(): string | null {
    if (noticeCache === null) {
        let value: string | null = null;
        try {
            value = sessionStorage.getItem(AUTH_NOTICE_KEY);
            if (value) sessionStorage.removeItem(AUTH_NOTICE_KEY);
        } catch {
            value = null;
        }
        noticeCache = { value };
    }
    return noticeCache.value;
}

/** Vứt bỏ thông báo đang chờ — dùng khi đã hiển thị xong, hoặc khi người dùng chủ động đăng xuất. */
export function clearAuthNotice(): void {
    noticeCache = { value: null };
    try {
        sessionStorage.removeItem(AUTH_NOTICE_KEY);
    } catch {
        /* bỏ qua */
    }
}

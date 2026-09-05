import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest } from '../api/auth';
import { clearAuth, clearAuthNotice, readAuth, setAuthNotice, writeAuth } from '../lib/authStorage';
import { AuthContext, type AuthUser } from './auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    // readAuth() tự loại bỏ phiên đã quá hạn ngay lúc khởi động app.
    const [user, setUser] = useState<AuthUser | null>(() => readAuth());

    /**
     * Kết thúc phiên. Có `notice` là do hết hạn (trang đăng nhập sẽ hiện lời nhắn);
     * không có là do người dùng chủ động đăng xuất, khi đó phải dọn sạch mọi lời nhắn cũ
     * kẻo trang đăng nhập hiện lại thông báo hết hạn của lần trước.
     */
    const endSession = useCallback((notice?: string) => {
        clearAuth();
        if (notice) setAuthNotice(notice);
        else clearAuthNotice();
        setUser(null);
    }, []);

    const logout = useCallback(() => endSession(), [endSession]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await loginRequest({ email, password });
        const next: AuthUser = {
            accessToken: res.accessToken,
            email: res.email,
            fullName: res.fullName,
            role: res.role,
            // expiresIn là SỐ GIÂY (JwtService.getExpirationSeconds), theo chuẩn OAuth.
            expiresAt: Date.now() + res.expiresIn * 1000,
        };
        writeAuth(next);
        setUser(next);
        return next;
    }, []);

    // Tự đăng xuất đúng lúc token hết hạn, không phải chờ server trả 401.
    useEffect(() => {
        if (!user) return;
        const expire = () =>
            endSession('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        const timer = setTimeout(expire, Math.max(0, user.expiresAt - Date.now()));

        // Tab bị treo nền có thể làm hẹn giờ chạy trễ, nên kiểm lại khi quay lại tab.
        // Căn theo expiresAt trong bộ nhớ, KHÔNG hỏi localStorage: nếu trình duyệt chặn
        // localStorage thì writeAuth() thất bại lặng lẽ và readAuth() luôn trả null,
        // sự kiện focus đầu tiên sẽ đá người dùng ra dù phiên còn hạn.
        const recheck = () => {
            if (Date.now() >= user.expiresAt) expire();
        };
        window.addEventListener('focus', recheck);
        document.addEventListener('visibilitychange', recheck);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', recheck);
            document.removeEventListener('visibilitychange', recheck);
        };
    }, [user, endSession]);

    // Đăng xuất ở tab này thì các tab khác cũng theo.
    useEffect(() => {
        const onStorage = () => setUser(readAuth());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const value = useMemo(
        () => ({ user, isAuthenticated: user !== null, login, logout }),
        [user, login, logout],
    );

    return <AuthContext value={value}>{children}</AuthContext>;
}

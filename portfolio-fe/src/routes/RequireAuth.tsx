import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';

/**
 * Chặn mọi route /admin/* trừ trang đăng nhập.
 * Hạn của token do AuthProvider canh: hết hạn là user về null ngay, không chờ 401 từ server.
 */
export function RequireAuth() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Nhớ chỗ đang muốn vào để đăng nhập xong quay lại đúng đó.
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}

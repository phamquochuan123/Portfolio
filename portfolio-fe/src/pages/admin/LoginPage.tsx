import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/auth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { clearAuthNotice, takeAuthNotice } from '../../lib/authStorage';
import { emailFormat, firstError, requiredText } from '../../lib/validation';

interface LocationState {
    from?: { pathname?: string };
}

export default function LoginPage() {
    useDocumentTitle('Đăng nhập — Quản trị');

    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Thông báo hết phiên do client API hoặc AuthProvider ghi lại trước khi điều hướng về đây.
    const [notice] = useState(takeAuthNotice);
    // Đã hiển thị rồi thì bỏ đi, để lần sau vào trang này không thấy lại thông báo cũ.
    useEffect(() => clearAuthNotice(), []);

    const from = (location.state as LocationState | null)?.from?.pathname ?? '/admin/projects';

    if (isAuthenticated) return <Navigate to={from} replace />;

    const emailError = firstError(requiredText(email, 'email'), emailFormat(email));
    const passwordError = requiredText(password, 'mật khẩu');

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (busy) return;

        setSubmitted(true);
        setFormError(null);
        if (emailError || passwordError) return;

        setBusy(true);
        try {
            await login(email.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            if (isApiError(err) && (err.is('INVALID_CREDENTIALS') || err.status === 401)) {
                setFormError('Email hoặc mật khẩu không đúng.');
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Đăng nhập thất bại, vui lòng thử lại.');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="mb-1 text-2xl font-bold tracking-tight">Đăng nhập</h1>
                <p className="mb-6 text-sm text-zinc-400">Khu vực quản trị portfolio.</p>

                {notice && (
                    <p
                        role="status"
                        className="mb-4 rounded-lg border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-300"
                    >
                        {notice}
                    </p>
                )}

                {formError && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
                    >
                        {formError}
                    </p>
                )}

                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
                    <Input
                        label="Email"
                        type="email"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={submitted ? emailError : undefined}
                    />

                    <Input
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={submitted ? passwordError : undefined}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
                            >
                                {showPassword ? 'Ẩn' : 'Hiện'}
                            </button>
                        }
                    />

                    <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
                        {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

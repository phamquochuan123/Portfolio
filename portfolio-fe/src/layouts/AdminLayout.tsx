import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UnreadProvider } from '../context/UnreadProvider';
import { useAuth } from '../context/auth';
import { useUnread } from '../context/unread';
import { cn } from '../lib/cn';

const NAV = [
    { to: '/admin/dashboard', label: 'Tổng quan' },
    { to: '/admin/projects', label: 'Dự án' },
    { to: '/admin/contacts', label: 'Tin nhắn' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const { user, logout } = useAuth();
    const { count } = useUnread();
    const navigate = useNavigate();

    return (
        <div className="flex h-full flex-col gap-6 p-4">
            <Link to="/" className="text-sm text-zinc-400 transition-colors hover:text-accent">
                ← Về trang chủ
            </Link>

            <nav aria-label="Điều hướng quản trị" className="flex flex-col gap-1">
                {NAV.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                    ? 'bg-zinc-800 font-medium text-accent'
                                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
                            )
                        }
                    >
                        <span>{item.label}</span>
                        {item.to === '/admin/contacts' && count > 0 && (
                            <span
                                aria-label={`${count} tin chưa đọc`}
                                className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-zinc-950"
                            >
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-zinc-800 pt-4">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">{user?.fullName}</p>
                    <p className="truncate text-xs text-zinc-400">{user?.email}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        logout();
                        navigate('/admin/login', { replace: true });
                    }}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-red-800 hover:text-red-300"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

export function AdminLayout() {
    const location = useLocation();
    // Drawer chỉ mở trong phạm vi một route: đổi trang là tự đóng.
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const drawerOpen = openedAt === location.pathname;

    return (
        <UnreadProvider>
            <div className="flex min-h-screen">
                <aside className="hidden w-60 shrink-0 border-r border-zinc-800 bg-zinc-900/40 lg:block">
                    <div className="sticky top-0 h-screen">
                        <SidebarContent />
                    </div>
                </aside>

                {drawerOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button
                            type="button"
                            aria-label="Đóng menu"
                            onClick={() => setOpenedAt(null)}
                            className="absolute inset-0 cursor-default bg-zinc-950/70"
                        />
                        <div className="relative h-full w-64 border-r border-zinc-800 bg-zinc-900">
                            <SidebarContent onNavigate={() => setOpenedAt(null)} />
                        </div>
                    </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-14 items-center gap-3 border-b border-zinc-800 px-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setOpenedAt(location.pathname)}
                            aria-expanded={drawerOpen}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
                        >
                            Menu
                        </button>
                        <span className="font-semibold text-zinc-200">Quản trị</span>
                    </header>

                    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </UnreadProvider>
    );
}

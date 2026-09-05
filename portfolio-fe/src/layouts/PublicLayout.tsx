import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../config/site';
import { cn } from '../lib/cn';

const NAV = [
    { to: '/', label: 'Trang chủ', end: true },
    { to: '/projects', label: 'Dự án', end: false },
    { to: '/contact', label: 'Liên hệ', end: false },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
        'rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'text-accent font-medium' : 'text-zinc-400 hover:text-zinc-100',
    );

export function PublicLayout() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Menu mobile chỉ mở trong phạm vi một route: đổi trang là nó tự đóng.
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const menuOpen = openedAt === location.pathname;
    const setMenuOpen = (open: boolean) => setOpenedAt(open ? location.pathname : null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-950"
            >
                Bỏ qua, tới nội dung chính
            </a>

            <header
                className={cn(
                    'sticky top-0 z-40 transition-colors',
                    scrolled
                        ? 'border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur'
                        : 'border-b border-transparent',
                )}
            >
                <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4">
                    <NavLink to="/" className="font-semibold tracking-tight text-zinc-100">
                        {site.name}
                    </NavLink>

                    <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 sm:flex">
                        {NAV.map((item) => (
                            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                        className="flex size-10 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800 sm:hidden"
                    >
                        <span aria-hidden="true" className="relative block h-4 w-5">
                            <span
                                className={cn(
                                    'absolute left-0 h-0.5 w-5 bg-current transition-transform',
                                    menuOpen ? 'top-1.5 rotate-45' : 'top-0',
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity',
                                    menuOpen && 'opacity-0',
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute left-0 h-0.5 w-5 bg-current transition-transform',
                                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
                                )}
                            />
                        </span>
                    </button>
                </div>

                <nav
                    id="mobile-nav"
                    aria-label="Điều hướng chính (mobile)"
                    hidden={!menuOpen}
                    className="border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur sm:hidden"
                >
                    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-4 py-2">
                        {NAV.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-lg px-3 py-3 text-sm transition-colors',
                                        isActive
                                            ? 'text-accent font-medium'
                                            : 'text-zinc-300 hover:bg-zinc-800',
                                    )
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </header>

            <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:py-16">
                <Outlet />
            </main>

            <footer className="mt-8 border-t border-zinc-800/80">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-zinc-400">
                        © {new Date().getFullYear()} {site.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href={site.githubUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-zinc-400 transition-colors hover:text-accent"
                        >
                            GitHub
                        </a>
                        <a
                            href={site.linkedinUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-zinc-400 transition-colors hover:text-accent"
                        >
                            LinkedIn
                        </a>
                        <Link to="/contact" className="text-zinc-400 transition-colors hover:text-accent">
                            Liên hệ
                        </Link>
                        <a
                            href={site.cvUrl}
                            download
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                        >
                            Tải CV
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

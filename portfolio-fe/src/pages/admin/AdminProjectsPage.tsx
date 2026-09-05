import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { deleteProject, getAdminProjects } from '../../api/projects';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate } from '../../lib/format';
import type { ProjectDetail, ProjectStatus } from '../../types';

const STATUS_FILTERS: { value: 'ALL' | ProjectStatus; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PUBLISHED', label: 'Đã đăng' },
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'ARCHIVED', label: 'Lưu trữ' },
];

interface FlashState {
    flash?: string;
}

export default function AdminProjectsPage() {
    useDocumentTitle('Quản lý dự án — Quản trị');

    const location = useLocation();
    const navigate = useNavigate();
    const { data, loading, error, refetch, setData } = useAsync(getAdminProjects);

    const [status, setStatus] = useState<'ALL' | ProjectStatus>('ALL');
    const [query, setQuery] = useState('');
    const [target, setTarget] = useState<ProjectDetail | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const [flash, setFlash] = useState<string | null>(
        () => (location.state as FlashState | null)?.flash ?? null,
    );

    // Xoá state điều hướng để F5 không hiện lại thông báo cũ.
    useEffect(() => {
        if ((location.state as FlashState | null)?.flash) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (data ?? []).filter((p) => {
            if (status !== 'ALL' && p.status !== status) return false;
            if (!q) return true;
            return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
        });
    }, [data, status, query]);

    async function confirmDelete() {
        if (!target) return;
        setDeleting(true);
        setActionError(null);
        try {
            await deleteProject(target.id);
            setData((prev) => (prev ?? []).filter((p) => p.id !== target.id));
            setFlash(`Đã xoá dự án "${target.title}".`);
            setTarget(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Không xoá được dự án.');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Dự án</h1>
                <Link
                    to="/admin/projects/new"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong"
                >
                    Thêm dự án
                </Link>
            </header>

            {flash && (
                <p
                    role="status"
                    className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300"
                >
                    {flash}
                </p>
            )}

            {actionError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
                >
                    {actionError}
                </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1" role="group" aria-label="Lọc theo trạng thái">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setStatus(f.value)}
                            aria-pressed={status === f.value}
                            className={
                                status === f.value
                                    ? 'rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-accent'
                                    : 'rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100'
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo tiêu đề hoặc slug..."
                    aria-label="Tìm dự án"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-1 focus:outline-accent sm:w-64"
                />
            </div>

            {loading && (
                <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            )}

            {!loading && error && <ErrorState error={error} onRetry={refetch} />}

            {!loading && !error && filtered.length === 0 && (
                <EmptyState
                    title={data?.length ? 'Không có dự án nào khớp bộ lọc.' : 'Chưa có dự án nào.'}
                    description={data?.length ? undefined : 'Bấm "Thêm dự án" để tạo cái đầu tiên.'}
                />
            )}

            {!loading && !error && filtered.length > 0 && (
                <>
                    {/* Desktop: bảng */}
                    <div className="hidden overflow-hidden rounded-xl border border-zinc-800 lg:block">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wide text-zinc-400">
                                <tr>
                                    <th className="p-3 font-medium">Ảnh</th>
                                    <th className="p-3 font-medium">Tiêu đề</th>
                                    <th className="p-3 font-medium">Trạng thái</th>
                                    <th className="p-3 text-right font-medium">Lượt xem</th>
                                    <th className="p-3 font-medium">Ngày đăng</th>
                                    <th className="p-3 text-right font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-900/40">
                                        <td className="p-3">
                                            <Thumb project={p} />
                                        </td>
                                        <td className="p-3">
                                            <p className="font-medium text-zinc-100">{p.title}</p>
                                            <p className="text-xs text-zinc-400">/{p.slug}</p>
                                        </td>
                                        <td className="p-3">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="p-3 text-right tabular-nums text-zinc-400">
                                            {p.viewCount}
                                        </td>
                                        <td className="p-3 text-zinc-400">{formatDate(p.publishedAt)}</td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-1">
                                                <RowActions project={p} onDelete={() => setTarget(p)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: danh sách thẻ */}
                    <ul className="flex flex-col gap-3 lg:hidden">
                        {filtered.map((p) => (
                            <li
                                key={p.id}
                                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <Thumb project={p} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-zinc-100">{p.title}</p>
                                        <p className="truncate text-xs text-zinc-400">/{p.slug}</p>
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span>{p.viewCount} lượt xem</span>
                                    <span>{formatDate(p.publishedAt)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <RowActions project={p} onDelete={() => setTarget(p)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <ConfirmDialog
                open={target !== null}
                danger
                loading={deleting}
                title="Xoá dự án?"
                description={
                    target
                        ? `"${target.title}" sẽ được xoá mềm: bản ghi vẫn còn trong cơ sở dữ liệu nhưng không hiện ở bất kỳ đâu nữa.`
                        : undefined
                }
                confirmLabel="Xoá"
                onConfirm={confirmDelete}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}

function Thumb({ project }: { project: ProjectDetail }) {
    if (project.thumbnailUrl) {
        return (
            <img
                src={project.thumbnailUrl}
                alt=""
                loading="lazy"
                className="size-12 shrink-0 rounded-lg border border-zinc-800 object-cover"
            />
        );
    }
    return (
        <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800 text-sm font-bold text-zinc-400"
        >
            {project.title.charAt(0).toUpperCase()}
        </div>
    );
}

function RowActions({ project, onDelete }: { project: ProjectDetail; onDelete: () => void }) {
    return (
        <>
            <Link
                to={`/admin/projects/${project.id}`}
                className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-accent"
            >
                Sửa
            </Link>
            {project.status === 'PUBLISHED' ? (
                <a
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-accent"
                >
                    Xem
                </a>
            ) : (
                <Button
                    size="sm"
                    variant="ghost"
                    disabled
                    title="Chỉ xem được khi dự án đã đăng"
                    className="px-2.5"
                >
                    Xem
                </Button>
            )}
            <button
                type="button"
                onClick={onDelete}
                className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-red-950/50 hover:text-red-300"
            >
                Xoá
            </button>
        </>
    );
}

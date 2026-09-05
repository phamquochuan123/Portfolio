import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deleteContact, getContacts, markContactRead } from '../../api/contacts';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUnread } from '../../context/unread';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatSmartTime, toDateAttr } from '../../lib/format';
import type { ContactResponse } from '../../types';

const PAGE_SIZE = 20;

export default function AdminContactsPage() {
    useDocumentTitle('Tin nhắn — Quản trị');

    const [params, setParams] = useSearchParams();
    // Trong URL đếm từ 1 cho dễ đọc, backend đếm từ 0.
    const uiPage = Math.max(1, Number(params.get('page') ?? '1') || 1);
    const unreadOnly = params.get('unread') === '1';

    const { data, loading, error, refetch, setData } = useAsync(
        () => getContacts({ page: uiPage - 1, size: PAGE_SIZE, unread: unreadOnly }),
        [uiPage, unreadOnly],
    );

    const { decrement, refresh } = useUnread();

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [target, setTarget] = useState<ContactResponse | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    function goTo(nextPage: number, nextUnread = unreadOnly) {
        const next = new URLSearchParams();
        if (nextPage > 1) next.set('page', String(nextPage));
        if (nextUnread) next.set('unread', '1');
        setParams(next);
        setExpandedId(null);
    }

    function patchItem(id: number, patch: Partial<ContactResponse>) {
        setData((prev) =>
            prev ? { ...prev, items: prev.items.map((c) => (c.id === id ? { ...c, ...patch } : c)) } : prev,
        );
    }

    async function toggleExpand(contact: ContactResponse) {
        const opening = expandedId !== contact.id;
        setExpandedId(opening ? contact.id : null);
        if (!opening || contact.read) return;

        // Đánh dấu đã đọc ngay trên giao diện, badge giảm theo, rồi mới gọi API.
        patchItem(contact.id, { read: true });
        decrement();
        try {
            const updated = await markContactRead(contact.id);
            patchItem(contact.id, updated);
        } catch {
            patchItem(contact.id, { read: false });
            refresh();
            setActionError('Không đánh dấu được đã đọc.');
        }
    }

    async function confirmDelete() {
        if (!target) return;
        setDeleting(true);
        setActionError(null);
        try {
            await deleteContact(target.id);
            if (!target.read) decrement();
            setTarget(null);
            refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Không xoá được tin nhắn.');
        } finally {
            setDeleting(false);
        }
    }

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Tin nhắn</h1>
                {data && (
                    <p className="text-sm text-zinc-400">{data.totalElements} tin</p>
                )}
            </header>

            {actionError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
                >
                    {actionError}
                </p>
            )}

            <div className="flex gap-1" role="group" aria-label="Lọc tin nhắn">
                {[
                    { label: 'Tất cả', value: false },
                    { label: 'Chưa đọc', value: true },
                ].map((tab) => (
                    <button
                        key={String(tab.value)}
                        type="button"
                        onClick={() => goTo(1, tab.value)}
                        aria-pressed={unreadOnly === tab.value}
                        className={
                            unreadOnly === tab.value
                                ? 'rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-accent'
                                : 'rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100'
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            )}

            {!loading && error && <ErrorState error={error} onRetry={refetch} />}

            {!loading && !error && items.length === 0 && (
                <EmptyState
                    title={unreadOnly ? 'Không có tin nào chưa đọc.' : 'Chưa có tin nhắn nào.'}
                />
            )}

            {!loading && !error && items.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {items.map((c) => {
                        const expanded = expandedId === c.id;
                        return (
                            <li
                                key={c.id}
                                className={
                                    'rounded-xl border bg-zinc-900/40 transition-colors ' +
                                    (c.read ? 'border-zinc-800' : 'border-zinc-700 bg-zinc-900/70')
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() => void toggleExpand(c)}
                                    aria-expanded={expanded}
                                    className="flex w-full items-start gap-3 p-4 text-left"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={
                                            'mt-1.5 size-2 shrink-0 rounded-full ' +
                                            (c.read ? 'bg-transparent' : 'bg-accent')
                                        }
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-baseline gap-x-2">
                                            <span
                                                className={
                                                    c.read
                                                        ? 'text-zinc-300'
                                                        : 'font-semibold text-zinc-100'
                                                }
                                            >
                                                {c.name}
                                            </span>
                                            <span className="text-xs text-zinc-400">{c.email}</span>
                                        </span>
                                        <span
                                            className={
                                                'mt-0.5 block truncate text-sm ' +
                                                (c.read ? 'text-zinc-400' : 'text-zinc-300')
                                            }
                                        >
                                            {c.subject ?? c.message}
                                        </span>
                                    </span>
                                    <time
                                        dateTime={toDateAttr(c.createdAt)}
                                        className="shrink-0 text-xs text-zinc-400"
                                    >
                                        {formatSmartTime(c.createdAt)}
                                    </time>
                                </button>

                                {expanded && (
                                    <div className="flex flex-col gap-4 border-t border-zinc-800 px-4 py-4">
                                        {c.subject && (
                                            <p className="text-sm font-medium text-zinc-200">
                                                {c.subject}
                                            </p>
                                        )}
                                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                                            {c.message}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <a
                                                href={`mailto:${c.email}?subject=${encodeURIComponent(
                                                    `Re: ${c.subject ?? 'Liên hệ từ portfolio'}`,
                                                )}`}
                                                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                                            >
                                                Trả lời
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setTarget(c)}
                                                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-300"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {!loading && !error && totalPages > 1 && (
                <nav aria-label="Phân trang" className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={uiPage <= 1}
                        onClick={() => goTo(uiPage - 1)}
                    >
                        ← Trước
                    </Button>
                    <span className="text-sm text-zinc-400">
                        Trang {uiPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!data?.hasNext}
                        onClick={() => goTo(uiPage + 1)}
                    >
                        Sau →
                    </Button>
                </nav>
            )}

            <ConfirmDialog
                open={target !== null}
                danger
                loading={deleting}
                title="Xoá tin nhắn?"
                description={target ? `Tin từ ${target.name} sẽ bị xoá vĩnh viễn.` : undefined}
                confirmLabel="Xoá"
                onConfirm={confirmDelete}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}

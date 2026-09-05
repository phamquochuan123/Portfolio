import type { ProjectStatus } from '../types';

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Nháp', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
    PUBLISHED: { label: 'Đã đăng', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    ARCHIVED: { label: 'Lưu trữ', className: 'bg-amber-950 text-amber-300 border-amber-800' },
};

export const STATUS_LABELS = STATUS;

export function StatusBadge({ status }: { status: ProjectStatus }) {
    const s = STATUS[status];
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}
        >
            {s.label}
        </span>
    );
}

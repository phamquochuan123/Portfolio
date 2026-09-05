import type { ReactNode } from 'react';

export interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-14 text-center">
            <p className="text-base font-medium text-zinc-300">{title}</p>
            {description && <p className="max-w-md text-sm text-zinc-400">{description}</p>}
            {action}
        </div>
    );
}

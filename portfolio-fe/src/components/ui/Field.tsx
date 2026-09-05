import type { ReactNode } from 'react';

export interface FieldProps {
    id: string;
    label: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    children: ReactNode;
}

/** Khung chung cho một ô nhập: nhãn, phần điều khiển, dòng gợi ý và dòng lỗi. */
export function Field({ id, label, error, hint, required, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-zinc-300">
                {label}
                {required && <span className="ml-1 text-red-400" aria-hidden="true">*</span>}
            </label>
            {children}
            <div className="flex min-h-[1.25rem] items-start justify-between gap-3 text-xs">
                <p id={`${id}-error`} role="alert" className="text-red-400">
                    {error}
                </p>
                {hint ? <span className="shrink-0 text-zinc-400">{hint}</span> : null}
            </div>
        </div>
    );
}

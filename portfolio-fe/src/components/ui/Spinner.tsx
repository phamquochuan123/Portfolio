import { cn } from '../../lib/cn';

const SIZES = {
    sm: 'size-4 border-2',
    md: 'size-6 border-2',
    lg: 'size-10 border-[3px]',
} as const;

export interface SpinnerProps {
    size?: keyof typeof SIZES;
    className?: string;
    label?: string;
}

export function Spinner({ size = 'md', className, label = 'Đang tải' }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cn(
                'inline-block animate-spin rounded-full border-zinc-700 border-t-accent',
                SIZES[size],
                className,
            )}
        />
    );
}

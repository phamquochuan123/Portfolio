import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
    primary: 'bg-accent text-zinc-950 hover:bg-accent-strong font-medium',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    outline: 'border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white',
} as const;

const SIZES = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
} as const;

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
    loading?: boolean;
    children?: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                VARIANTS[variant],
                SIZES[size],
                className,
            )}
            {...rest}
        >
            {loading && <Spinner size="sm" className="border-current/30 border-t-current" />}
            {children}
        </button>
    );
}

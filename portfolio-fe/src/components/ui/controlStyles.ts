export const CONTROL_CLASS =
    'w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400 ' +
    'transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-accent ' +
    'disabled:cursor-not-allowed disabled:opacity-60';

export function borderClass(hasError: boolean): string {
    return hasError ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600';
}

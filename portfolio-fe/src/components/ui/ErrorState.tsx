import { Button } from './Button';

export interface ErrorStateProps {
    title?: string;
    message?: string;
    error?: Error | null;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Không tải được dữ liệu',
    message,
    error,
    onRetry,
}: ErrorStateProps) {
    const detail = message ?? error?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-6 py-12 text-center"
        >
            <p className="text-base font-medium text-red-300">{title}</p>
            <p className="max-w-md text-sm text-zinc-400">{detail}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    Thử lại
                </Button>
            )}
        </div>
    );
}

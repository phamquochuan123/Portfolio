import { useRouteError } from 'react-router-dom';

/** Màn hình lỗi cho toàn bộ cây route — thay cho trang trắng khi một route ném lỗi. */
export default function RouteErrorPage() {
    const error = useRouteError();
    const message = error instanceof Error ? error.message : null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
            <p className="max-w-md text-sm text-zinc-400">
                Trang gặp sự cố ngoài dự tính. Thử tải lại, nếu vẫn lỗi thì quay lại sau ít phút.
            </p>
            {message && (
                <p className="max-w-md rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 font-mono text-xs text-zinc-400">
                    {message}
                </p>
            )}
            <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong"
            >
                Về trang chủ
            </button>
        </div>
    );
}

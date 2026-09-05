import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/** Bắt lỗi render ở gốc cây React để không rơi vào trang trắng. */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Lỗi không bắt được:', error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-zinc-100">
                <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
                <p className="max-w-md text-sm text-zinc-400">
                    Trang gặp sự cố ngoài dự tính. Thử tải lại, nếu vẫn lỗi thì quay lại sau ít phút.
                </p>
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
}

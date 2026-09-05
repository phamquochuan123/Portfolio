import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
    useDocumentTitle('Không tìm thấy trang — Phạm Quốc Huân');
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-6xl font-bold text-accent">404</p>
            <h1 className="text-xl font-semibold text-zinc-200">Không tìm thấy trang này.</h1>
            <Link
                to="/"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                Về trang chủ
            </Link>
        </div>
    );
}

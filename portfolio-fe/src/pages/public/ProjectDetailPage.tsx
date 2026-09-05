import { Link, useParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { getProjectBySlug } from '../../api/projects';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, toDateAttr } from '../../lib/format';

/** Nội dung là văn bản thô từ DB — tách theo dòng trống thành đoạn, không render HTML. */
function ProjectContent({ content }: { content: string }) {
    const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 text-zinc-300 leading-relaxed">
            {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                    {p}
                </p>
            ))}
        </div>
    );
}

export default function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data, loading, error, refetch } = useAsync(
        () => getProjectBySlug(slug ?? ''),
        [slug],
    );

    useDocumentTitle(data ? `${data.title} — Phạm Quốc Huân` : null);

    const notFound = isApiError(error) && (error.status === 404 || error.is('RESOURCE_NOT_FOUND'));

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="aspect-[16/9] w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Không tìm thấy dự án</h1>
                <p className="max-w-md text-zinc-400">
                    Dự án bạn tìm không tồn tại hoặc chưa được công bố.
                </p>
                <Link
                    to="/projects"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong"
                >
                    Về danh sách dự án
                </Link>
            </div>
        );
    }

    if (error) return <ErrorState error={error} onRetry={refetch} />;
    if (!data) return null;

    return (
        <article className="flex flex-col gap-8">
            <Link to="/projects" className="text-sm text-zinc-400 transition-colors hover:text-accent">
                ← Tất cả dự án
            </Link>

            <header className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    {data.title}
                </h1>
                {data.publishedAt && (
                    <time dateTime={toDateAttr(data.publishedAt)} className="text-sm text-zinc-400">
                        {formatDate(data.publishedAt)}
                    </time>
                )}
                {data.summary && <p className="max-w-prose text-lg text-zinc-400">{data.summary}</p>}
            </header>

            {data.thumbnailUrl && (
                <img
                    src={data.thumbnailUrl}
                    alt={`Ảnh minh hoạ dự án ${data.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded-xl border border-zinc-800 object-cover"
                />
            )}

            {(data.demoUrl || data.repoUrl) && (
                <div className="flex flex-wrap gap-3">
                    {data.demoUrl && (
                        <a
                            href={data.demoUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong"
                        >
                            Xem demo
                        </a>
                    )}
                    {data.repoUrl && (
                        <a
                            href={data.repoUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                        >
                            Mã nguồn
                        </a>
                    )}
                </div>
            )}

            {data.content && <ProjectContent content={data.content} />}
        </article>
    );
}

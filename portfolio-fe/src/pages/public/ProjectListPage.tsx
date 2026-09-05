import { ProjectCard, ProjectCardSkeleton } from '../../components/ProjectCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getProjects } from '../../api/projects';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProjectListPage() {
    useDocumentTitle('Dự án — Phạm Quốc Huân');
    const { data, loading, error, refetch } = useAsync(getProjects);

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dự án</h1>
                <p className="text-zinc-400">Những thứ tôi đã xây và học được từ đó.</p>
            </header>

            {loading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {!loading && error && <ErrorState error={error} onRetry={refetch} />}

            {!loading && !error && data?.length === 0 && <EmptyState title="Chưa có dự án nào." />}

            {!loading && !error && data && data.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            )}
        </div>
    );
}

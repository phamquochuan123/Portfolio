import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero.png';
import { getProjects } from '../../api/projects';
import { ProjectCard, ProjectCardSkeleton } from '../../components/ProjectCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { site } from '../../config/site';
import { useAsync } from '../../hooks/useAsync';
import { BASE_TITLE, useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function HomePage() {
    useDocumentTitle(BASE_TITLE);
    const { data, loading, error, refetch } = useAsync(getProjects);
    const featured = data?.slice(0, 3) ?? [];

    return (
        <div className="flex flex-col gap-20">
            <section className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
                <div className="flex flex-col gap-5">
                    <p className="text-sm font-medium tracking-wide text-accent uppercase">{site.role}</p>
                    <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                        {site.name}
                    </h1>
                    <p className="max-w-prose text-zinc-400">{site.tagline}</p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/projects"
                            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-strong"
                        >
                            Xem dự án
                        </Link>
                        <Link
                            to="/contact"
                            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                        >
                            Liên hệ
                        </Link>
                    </div>
                </div>

                <img
                    src={heroImage}
                    alt=""
                    className="mx-auto w-full max-w-xs rounded-2xl border border-zinc-800 object-cover md:max-w-full"
                />
            </section>

            <section className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold tracking-tight">Kỹ năng</h2>
                <ul className="flex flex-wrap gap-2">
                    {site.skills.map((skill) => (
                        <li
                            key={skill}
                            className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-300"
                        >
                            {skill}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="flex flex-col gap-5">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Dự án nổi bật</h2>
                    <Link to="/projects" className="text-sm text-accent hover:underline">
                        Xem tất cả →
                    </Link>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <ProjectCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!loading && error && <ErrorState error={error} onRetry={refetch} />}

                {!loading && !error && featured.length === 0 && (
                    <EmptyState title="Chưa có dự án nào." />
                )}

                {!loading && !error && featured.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((p) => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

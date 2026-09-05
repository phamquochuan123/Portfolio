import { Link } from 'react-router-dom';
import { formatDate, toDateAttr } from '../lib/format';
import type { ProjectSummary } from '../types';
import { Skeleton } from './ui/Skeleton';

export function ProjectCard({ project }: { project: ProjectSummary }) {
    return (
        <article className="group h-full">
            <Link
                to={`/projects/${project.slug}`}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                {/* Tỉ lệ khung cố định để ảnh tải xong không làm giật layout. */}
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-800">
                    {project.thumbnailUrl ? (
                        <img
                            src={project.thumbnailUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="flex size-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-4xl font-bold text-zinc-600"
                        >
                            {project.title.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="font-semibold text-zinc-100 transition-colors group-hover:text-accent">
                        {project.title}
                    </h3>
                    {project.summary && (
                        <p className="line-clamp-2 text-sm text-zinc-400">{project.summary}</p>
                    )}
                    {project.publishedAt && (
                        <time
                            dateTime={toDateAttr(project.publishedAt)}
                            className="mt-auto pt-2 text-xs text-zinc-400"
                        >
                            {formatDate(project.publishedAt)}
                        </time>
                    )}
                </div>
            </Link>
        </article>
    );
}

export function ProjectCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="flex flex-col gap-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-24" />
            </div>
        </div>
    );
}

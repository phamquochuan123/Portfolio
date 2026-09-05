import { Link } from 'react-router-dom';
import { getStats } from '../../api/stats';
import { ChartCard, DailyColumns, HorizontalBars, StatTile } from '../../components/admin/charts';
import { formatNumber, shortDate } from '../../components/admin/chartUtils';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AdminDashboardPage() {
    useDocumentTitle('Tổng quan — Quản trị');
    const { data, loading, error, refetch } = useAsync(getStats);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-8 w-40" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-72" />
                    <Skeleton className="h-72" />
                </div>
            </div>
        );
    }

    if (error) return <ErrorState error={error} onRetry={refetch} />;
    if (!data) return null;

    const totalContactsIn14Days = data.contactsPerDay.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile
                    label="Dự án đã đăng"
                    value={data.projectsPublished}
                    hint={`${data.projectsDraft} nháp · ${data.projectsArchived} lưu trữ`}
                />
                <StatTile label="Tổng lượt xem" value={data.totalViews} />
                <StatTile label="Tin nhắn" value={data.contactsTotal} />
                <StatTile
                    label="Chưa đọc"
                    value={data.contactsUnread}
                    hint={data.contactsUnread > 0 ? 'Có tin đang chờ bạn' : 'Đã đọc hết'}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                    title="Dự án xem nhiều nhất"
                    subtitle="Tính từ khi bắt đầu đếm lượt xem"
                    table={
                        <table className="w-full text-left">
                            <thead className="text-zinc-400">
                                <tr>
                                    <th className="py-1 pr-4 font-medium">Dự án</th>
                                    <th className="py-1 font-medium">Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody className="text-zinc-300">
                                {data.topProjects.map((p) => (
                                    <tr key={p.id}>
                                        <td className="py-1 pr-4">{p.title}</td>
                                        <td className="py-1 tabular-nums">{formatNumber(p.viewCount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                >
                    {data.topProjects.length === 0 ? (
                        <EmptyState title="Chưa có dự án nào." />
                    ) : (
                        <HorizontalBars
                            unit="lượt"
                            data={data.topProjects.map((p) => ({ label: p.title, value: p.viewCount }))}
                        />
                    )}
                </ChartCard>

                <ChartCard
                    title="Tin nhắn 14 ngày gần nhất"
                    subtitle={`${totalContactsIn14Days} tin trong 14 ngày`}
                    table={
                        <table className="w-full text-left">
                            <thead className="text-zinc-400">
                                <tr>
                                    <th className="py-1 pr-4 font-medium">Ngày</th>
                                    <th className="py-1 font-medium">Số tin</th>
                                </tr>
                            </thead>
                            <tbody className="text-zinc-300">
                                {data.contactsPerDay.map((d) => (
                                    <tr key={d.date}>
                                        <td className="py-1 pr-4">{shortDate(d.date)}</td>
                                        <td className="py-1 tabular-nums">{d.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                >
                    <DailyColumns data={data.contactsPerDay} />
                </ChartCard>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
                <Link
                    to="/admin/projects"
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                >
                    Quản lý dự án
                </Link>
                <Link
                    to="/admin/contacts"
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 transition-colors hover:border-accent hover:text-accent"
                >
                    Xem tin nhắn
                </Link>
            </div>
        </div>
    );
}

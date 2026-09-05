import type { ReactNode } from 'react';
import {
    MARK_COLOR,
    MARK_EMPTY,
    formatNumber,
    shortDate,
    type BarDatum,
    type DailyDatum,
} from './chartUtils';

export function ChartCard({
    title,
    subtitle,
    children,
    table,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    table: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div>
                <h2 className="font-semibold text-zinc-100">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>}
            </div>
            {children}
            {/* Kênh thay thế cho biểu đồ: mọi giá trị đều đọc được dạng bảng. */}
            <details className="text-xs">
                <summary className="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-200">
                    Xem dạng bảng
                </summary>
                <div className="mt-3 overflow-x-auto">{table}</div>
            </details>
        </section>
    );
}

export function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-sm text-zinc-400">{label}</p>
            {/* Số lớn dùng chữ số tỉ lệ; tabular-nums chỉ dành cho cột số xếp thẳng hàng. */}
            <p className="text-3xl font-semibold text-zinc-100">{formatNumber(value)}</p>
            {hint && <p className="text-xs text-zinc-400">{hint}</p>}
        </div>
    );
}

/** Thanh ngang: nhãn dài nên để nằm ngang, giá trị ghi ngay cạnh nhãn. */
export function HorizontalBars({ data, unit }: { data: BarDatum[]; unit: string }) {
    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <ul className="flex flex-col gap-3">
            {data.map((d) => (
                <li key={d.label} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-zinc-300">{d.label}</span>
                        <span className="shrink-0 tabular-nums text-zinc-400">
                            {formatNumber(d.value)} {unit}
                        </span>
                    </div>
                    <div className="flex h-4 items-center rounded bg-zinc-800/50">
                        <div
                            className="h-2.5 rounded-r-[4px] transition-[width] duration-300"
                            style={{
                                width: `${d.value === 0 ? 0 : Math.max(2, (d.value / max) * 100)}%`,
                                backgroundColor: MARK_COLOR,
                            }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Cột theo ngày. Nhãn trục thưa để không chồng chữ; chỉ ghi số ở cột cao nhất. */
export function DailyColumns({ data }: { data: DailyDatum[] }) {
    const max = Math.max(...data.map((d) => d.count));
    const peakIndex = max > 0 ? data.findIndex((d) => d.count === max) : -1;
    const labelEvery = Math.max(1, Math.ceil(data.length / 5));

    return (
        <div className="flex flex-col gap-2">
            <div
                role="img"
                aria-label={`Số tin nhắn theo ngày trong ${data.length} ngày gần nhất, cao nhất ${max} tin`}
                className="flex h-40 items-end gap-[2px]"
            >
                {data.map((d, i) => (
                    <div
                        key={d.date}
                        // Vùng chạm phủ hết chiều cao cột nên cột thấp vẫn dễ trỏ tới.
                        className="group relative flex h-full flex-1 flex-col justify-end"
                    >
                        {i === peakIndex && (
                            <span className="mb-1 text-center text-[10px] tabular-nums text-zinc-300">
                                {d.count}
                            </span>
                        )}
                        <div
                            className="w-full rounded-t-[4px] transition-[height] duration-300"
                            style={{
                                height: d.count === 0 ? '2px' : `${Math.max(6, (d.count / max) * 100)}%`,
                                backgroundColor: d.count === 0 ? MARK_EMPTY : MARK_COLOR,
                            }}
                        />
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] whitespace-nowrap text-zinc-200 shadow-lg group-hover:block">
                            {shortDate(d.date)}: {d.count} tin
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex gap-[2px]">
                {data.map((d, i) => (
                    <span key={d.date} className="flex-1 text-center text-[10px] text-zinc-400">
                        {i % labelEvery === 0 ? shortDate(d.date) : ''}
                    </span>
                ))}
            </div>
        </div>
    );
}

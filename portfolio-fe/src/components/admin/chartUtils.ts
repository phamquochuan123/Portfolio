/**
 * Màu vẽ dữ liệu: emerald-600.
 * Đã chạy qua validator của bộ quy tắc trực quan hoá trên nền zinc-900 (#18181b):
 * lightness nằm trong băng dark 0.48–0.67, tương phản ≥ 3:1. Màu nhấn emerald-400
 * của site (#34d399) trượt băng lightness (0.773) nên không dùng làm màu mark.
 */
export const MARK_COLOR = '#059669';

/** Cột giá trị bằng 0 vẫn vẽ một vạch xám mờ để thấy ngày đó có tồn tại. */
export const MARK_EMPTY = '#3f3f46';

const nf = new Intl.NumberFormat('vi-VN');

export const formatNumber = (n: number) => nf.format(n);

/** dd/MM từ chuỗi "YYYY-MM-DD" */
export function shortDate(iso: string): string {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
}

export interface BarDatum {
    label: string;
    value: number;
}

export interface DailyDatum {
    date: string;
    count: number;
}

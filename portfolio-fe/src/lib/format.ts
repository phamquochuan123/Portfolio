/**
 * Backend trả LocalDateTime dạng "2026-09-05T14:30:00" — không timezone, không chữ Z.
 * new Date() hiểu chuỗi này là giờ địa phương, đúng ý định, nên không cộng trừ offset.
 */
function parse(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** dd/MM/yyyy */
export function formatDate(value: string | null | undefined): string {
    const d = parse(value);
    if (!d) return '—';
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** dd/MM/yyyy HH:mm */
export function formatDateTime(value: string | null | undefined): string {
    const d = parse(value);
    if (!d) return '—';
    return `${formatDate(value)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Dưới 24 giờ thì hiện tương đối, cũ hơn thì dd/MM/yyyy HH:mm. */
export function formatSmartTime(value: string | null | undefined): string {
    const d = parse(value);
    if (!d) return '—';

    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0 || diffMs >= 24 * 60 * 60 * 1000) return formatDateTime(value);

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    return `${Math.floor(minutes / 60)} giờ trước`;
}

/** Dùng cho thuộc tính dateTime của thẻ <time>. */
export function toDateAttr(value: string | null | undefined): string | undefined {
    return parse(value) ? value! : undefined;
}

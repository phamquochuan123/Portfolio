/** Ghép class, bỏ qua giá trị rỗng/false/undefined. */
export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

/** Bỏ dấu tiếng Việt rồi rút gọn thành slug: chữ thường, số, gạch ngang. */
export function slugify(input: string): string {
    return input
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[đ]/g, 'd')
        .replace(/[Đ]/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

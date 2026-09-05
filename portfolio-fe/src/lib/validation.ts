export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function requiredText(value: string, label: string): string | undefined {
    if (!value.trim()) return `Vui lòng nhập ${label}.`;
    return undefined;
}

export function maxLength(value: string, max: number, label: string): string | undefined {
    if (value.length > max) return `${label} tối đa ${max} ký tự.`;
    return undefined;
}

export function minLength(value: string, min: number, label: string): string | undefined {
    if (value.trim().length < min) return `${label} tối thiểu ${min} ký tự.`;
    return undefined;
}

export function emailFormat(value: string): string | undefined {
    if (value.trim() && !EMAIL_RE.test(value.trim())) return 'Email không đúng định dạng.';
    return undefined;
}

/** Trả về lỗi đầu tiên khác undefined. */
export function firstError(...checks: (string | undefined)[]): string | undefined {
    return checks.find((c) => c !== undefined);
}

export interface ParsedValidation<T extends string> {
    fieldErrors: FieldErrors<T>;
    /** Phần không nhận ra tên field — hiện nguyên câu ở đầu form. */
    unmatched: string[];
}

/**
 * Backend nối lỗi validate thành "field: lời nhắn: field2: lời nhắn2".
 * Tách bằng cách đi qua từng mẩu ": ", mẩu nào trùng tên field đã biết thì mở
 * một lỗi mới, còn lại nối tiếp vào lời nhắn đang dở.
 */
export function parseValidationMessage<T extends string>(
    message: string,
    knownFields: readonly T[],
): ParsedValidation<T> {
    const fieldErrors: FieldErrors<T> = {};
    const unmatched: string[] = [];

    const parts = message.split(': ');
    let current: T | null = null;
    let buffer: string[] = [];

    const flush = () => {
        const text = buffer.join(': ').trim();
        if (!text) return;
        if (current) fieldErrors[current] = text;
        else unmatched.push(text);
        buffer = [];
    };

    for (const part of parts) {
        const match = knownFields.find((f) => f === part.trim());
        if (match) {
            flush();
            current = match;
        } else {
            buffer.push(part);
        }
    }
    flush();

    if (Object.keys(fieldErrors).length === 0 && unmatched.length === 0) {
        unmatched.push(message);
    }
    return { fieldErrors, unmatched };
}

import { useRef, useState } from 'react';
import { isApiError } from '../../api/client';
import { MAX_UPLOAD_BYTES, uploadMedia } from '../../api/media';
import { Input } from '../ui/Input';

export interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    onBlur?: () => void;
    error?: string;
    /** Gắn ảnh vào project khi đang sửa một project đã có id. */
    projectId?: number;
}

export function ImageUploadField({
    value,
    onChange,
    onBlur,
    error,
    projectId,
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function handleFile(file: File) {
        setUploadError(null);

        if (!file.type.startsWith('image/')) {
            setUploadError('Chỉ nhận tệp ảnh.');
            return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            const mb = (file.size / 1024 / 1024).toFixed(1);
            setUploadError(`Ảnh nặng ${mb}MB, vượt giới hạn 5MB.`);
            return;
        }

        setUploading(true);
        try {
            const media = await uploadMedia(file, { projectId });
            onChange(media.url);
        } catch (err) {
            if (isApiError(err) && (err.status === 413 || err.is('File_TOO_LARGE'))) {
                setUploadError('Tệp vượt quá giới hạn 5MB của máy chủ.');
            } else if (isApiError(err) && err.is('INVALID_FILE')) {
                setUploadError(err.message || 'Tệp không hợp lệ.');
            } else if (err instanceof Error) {
                setUploadError(err.message);
            } else {
                setUploadError('Tải ảnh lên thất bại.');
            }
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Input
                label="Ảnh đại diện (thumbnailUrl)"
                type="url"
                maxLength={500}
                placeholder="https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                error={error}
                hint={`${value.length}/500`}
            />

            <div className="flex flex-wrap items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                    }}
                />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="text-sm text-zinc-400 transition-colors hover:text-red-300"
                    >
                        Bỏ ảnh
                    </button>
                )}
                <span className="text-xs text-zinc-400">Ảnh, tối đa 5MB.</span>
            </div>

            {uploading && (
                <div
                    role="progressbar"
                    aria-label="Đang tải ảnh lên"
                    className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"
                >
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
                </div>
            )}

            {uploadError && (
                <p role="alert" className="text-xs text-red-400">
                    {uploadError}
                </p>
            )}

            {value && (
                <img
                    src={value}
                    alt="Xem trước ảnh đại diện"
                    className="max-h-48 w-auto rounded-lg border border-zinc-800 object-contain"
                />
            )}
        </div>
    );
}

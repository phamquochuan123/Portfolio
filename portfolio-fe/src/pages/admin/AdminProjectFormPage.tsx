import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { createProject, getAdminProjects, updateProject } from '../../api/projects';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { Textarea } from '../../components/ui/Textarea';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { slugify } from '../../lib/slugify';
import {
    SLUG_RE,
    firstError,
    maxLength,
    parseValidationMessage,
    requiredText,
    type FieldErrors,
} from '../../lib/validation';
import type { ProjectDetail, ProjectRequest, ProjectStatus } from '../../types';

const FIELDS = [
    'title',
    'slug',
    'summary',
    'content',
    'thumbnailUrl',
    'demoUrl',
    'repoUrl',
    'status',
] as const;
type ProjectField = (typeof FIELDS)[number];

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'PUBLISHED', label: 'Đã đăng' },
    { value: 'ARCHIVED', label: 'Lưu trữ' },
];

const EMPTY: ProjectRequest = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    demoUrl: '',
    repoUrl: '',
    status: 'DRAFT',
};

function validate(v: ProjectRequest): FieldErrors<ProjectField> {
    return {
        title: firstError(requiredText(v.title, 'tiêu đề'), maxLength(v.title, 255, 'Tiêu đề')),
        slug: firstError(
            requiredText(v.slug, 'slug'),
            maxLength(v.slug, 255, 'Slug'),
            v.slug.trim() && !SLUG_RE.test(v.slug.trim())
                ? 'Slug chỉ gồm chữ thường, số và dấu gạch ngang (vd: du-an-cua-toi).'
                : undefined,
        ),
        summary: maxLength(v.summary, 500, 'Tóm tắt'),
        thumbnailUrl: maxLength(v.thumbnailUrl, 500, 'Đường dẫn ảnh'),
        demoUrl: maxLength(v.demoUrl, 500, 'Đường dẫn demo'),
        repoUrl: maxLength(v.repoUrl, 500, 'Đường dẫn mã nguồn'),
    };
}

function toRequest(p: ProjectDetail): ProjectRequest {
    return {
        title: p.title,
        slug: p.slug,
        summary: p.summary ?? '',
        content: p.content ?? '',
        thumbnailUrl: p.thumbnailUrl ?? '',
        demoUrl: p.demoUrl ?? '',
        repoUrl: p.repoUrl ?? '',
        status: p.status,
    };
}

export default function AdminProjectFormPage() {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? Number(id) : undefined;
    const isEdit = projectId !== undefined;
    const navigate = useNavigate();

    useDocumentTitle(isEdit ? 'Sửa dự án — Quản trị' : 'Thêm dự án — Quản trị');

    // Backend chưa có endpoint lấy 1 project theo id cho admin, nên tải cả danh sách rồi lọc.
    // Không dùng endpoint public theo slug vì project DRAFT sẽ không trả về.
    const list = useAsync(
        () => (isEdit ? getAdminProjects() : Promise.resolve<ProjectDetail[]>([])),
        [isEdit],
    );

    const existing = useMemo(
        () => (isEdit ? (list.data ?? []).find((p) => p.id === projectId) ?? null : null),
        [isEdit, list.data, projectId],
    );

    const [values, setValues] = useState<ProjectRequest>(EMPTY);
    const [initial, setInitial] = useState<ProjectRequest>(EMPTY);
    const [loadedFor, setLoadedFor] = useState<number | null>(null);
    const [slugTouchedByUser, setSlugTouchedByUser] = useState(false);
    const [touched, setTouched] = useState<Partial<Record<ProjectField, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverErrors, setServerErrors] = useState<FieldErrors<ProjectField>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Nạp dữ liệu vào form ngay khi tìm được project — làm trong render, không dùng effect.
    if (existing && loadedFor !== existing.id) {
        const next = toRequest(existing);
        setValues(next);
        setInitial(next);
        setSlugTouchedByUser(true);
        setLoadedFor(existing.id);
    }

    const dirty = JSON.stringify(values) !== JSON.stringify(initial);
    const skipBlockRef = useRef(false);

    // Cảnh báo khi đóng/refresh tab lúc còn thay đổi chưa lưu.
    useEffect(() => {
        if (!dirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);

    // Chặn điều hướng trong app khi form còn thay đổi chưa lưu.
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            dirty && !skipBlockRef.current && currentLocation.pathname !== nextLocation.pathname,
    );

    const clientErrors = validate(values);
    const errorFor = (field: ProjectField): string | undefined =>
        serverErrors[field] ?? (touched[field] || submitted ? clientErrors[field] : undefined);

    function setField<K extends keyof ProjectRequest>(field: K, value: ProjectRequest[K]) {
        setValues((v) => ({ ...v, [field]: value }));
        setServerErrors((prev) =>
            prev[field as ProjectField] ? { ...prev, [field as ProjectField]: undefined } : prev,
        );
    }

    function onTitleChange(title: string) {
        setValues((v) => ({
            ...v,
            title,
            // Tự sinh slug khi tạo mới và người dùng chưa tự sửa slug.
            slug: !isEdit && !slugTouchedByUser ? slugify(title) : v.slug,
        }));
        setServerErrors((prev) => (prev.title ? { ...prev, title: undefined } : prev));
    }

    const blur = (field: ProjectField) => () => setTouched((t) => ({ ...t, [field]: true }));

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (saving) return;

        setSubmitted(true);
        setFormError(null);
        setServerErrors({});
        if (FIELDS.some((f) => clientErrors[f])) return;

        const payload: ProjectRequest = {
            title: values.title.trim(),
            slug: values.slug.trim(),
            summary: values.summary.trim(),
            content: values.content,
            thumbnailUrl: values.thumbnailUrl.trim(),
            demoUrl: values.demoUrl.trim(),
            repoUrl: values.repoUrl.trim(),
            status: values.status,
        };

        setSaving(true);
        try {
            const saved = isEdit
                ? await updateProject(projectId, payload)
                : await createProject(payload);

            skipBlockRef.current = true;
            setInitial(payload);
            navigate('/admin/projects', {
                replace: true,
                state: { flash: `Đã lưu dự án "${saved.title}".` },
            });
        } catch (err) {
            if (isApiError(err) && err.is('DUPLICATE_RESOURCE')) {
                setServerErrors({ slug: 'Slug này đã tồn tại.' });
            } else if (isApiError(err) && err.is('VALIDATION_FAILED')) {
                const { fieldErrors, unmatched } = parseValidationMessage(err.message, FIELDS);
                setServerErrors(fieldErrors);
                if (unmatched.length > 0) setFormError(unmatched.join(' '));
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Không lưu được dự án.');
            }
        } finally {
            setSaving(false);
        }
    }

    function leave() {
        skipBlockRef.current = true;
        navigate('/admin/projects');
    }

    if (isEdit && list.loading) {
        return (
            <div className="flex max-w-3xl flex-col gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (isEdit && list.error) {
        return <ErrorState error={list.error} onRetry={list.refetch} />;
    }

    if (isEdit && !list.loading && !existing) {
        return (
            <ErrorState
                title="Không tìm thấy dự án"
                message={`Không có dự án nào với id ${id}.`}
                onRetry={list.refetch}
            />
        );
    }

    return (
        <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? 'Sửa dự án' : 'Thêm dự án'}
            </h1>

            {formError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
                >
                    {formError}
                </p>
            )}

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
                <Input
                    label="Tiêu đề"
                    required
                    maxLength={255}
                    value={values.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={blur('title')}
                    error={errorFor('title')}
                    hint={`${values.title.length}/255`}
                />

                <Input
                    label="Slug"
                    required
                    maxLength={255}
                    value={values.slug}
                    onChange={(e) => {
                        setSlugTouchedByUser(true);
                        setField('slug', e.target.value);
                    }}
                    onBlur={blur('slug')}
                    error={errorFor('slug')}
                    hint={`${values.slug.length}/255`}
                />

                <Textarea
                    label="Tóm tắt"
                    rows={3}
                    maxLength={500}
                    value={values.summary}
                    onChange={(e) => setField('summary', e.target.value)}
                    onBlur={blur('summary')}
                    error={errorFor('summary')}
                    hint={`${values.summary.length}/500`}
                />

                <Textarea
                    label="Nội dung"
                    rows={16}
                    value={values.content}
                    onChange={(e) => setField('content', e.target.value)}
                    onBlur={blur('content')}
                    error={errorFor('content')}
                    hint="Cách một dòng trống để sang đoạn mới"
                />

                <ImageUploadField
                    value={values.thumbnailUrl}
                    onChange={(url) => setField('thumbnailUrl', url)}
                    onBlur={blur('thumbnailUrl')}
                    error={errorFor('thumbnailUrl')}
                    projectId={projectId}
                />

                <Input
                    label="Đường dẫn demo"
                    type="url"
                    maxLength={500}
                    placeholder="https://..."
                    value={values.demoUrl}
                    onChange={(e) => setField('demoUrl', e.target.value)}
                    onBlur={blur('demoUrl')}
                    error={errorFor('demoUrl')}
                    hint={`${values.demoUrl.length}/500`}
                />

                <Input
                    label="Đường dẫn mã nguồn"
                    type="url"
                    maxLength={500}
                    placeholder="https://github.com/..."
                    value={values.repoUrl}
                    onChange={(e) => setField('repoUrl', e.target.value)}
                    onBlur={blur('repoUrl')}
                    error={errorFor('repoUrl')}
                    hint={`${values.repoUrl.length}/500`}
                />

                <Select
                    label="Trạng thái"
                    required
                    options={STATUS_OPTIONS}
                    value={values.status}
                    onChange={(e) => setField('status', e.target.value as ProjectStatus)}
                    error={errorFor('status')}
                />

                <div className="mt-2 flex gap-3">
                    <Button type="submit" size="lg" loading={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu dự án'}
                    </Button>
                    <Button type="button" variant="ghost" size="lg" onClick={leave} disabled={saving}>
                        Huỷ
                    </Button>
                </div>
            </form>

            <ConfirmDialog
                open={blocker.state === 'blocked'}
                danger
                title="Rời trang khi chưa lưu?"
                description="Những thay đổi bạn vừa nhập sẽ mất."
                confirmLabel="Rời trang"
                cancelLabel="Ở lại"
                onConfirm={() => blocker.proceed?.()}
                onCancel={() => blocker.reset?.()}
            />
        </div>
    );
}

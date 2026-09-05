import { useState, type FormEvent } from 'react';
import { isApiError } from '../../api/client';
import { sendContact } from '../../api/contacts';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { site } from '../../config/site';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
    emailFormat,
    firstError,
    maxLength,
    minLength,
    parseValidationMessage,
    requiredText,
    type FieldErrors,
} from '../../lib/validation';

const FIELDS = ['name', 'email', 'subject', 'message'] as const;
type ContactField = (typeof FIELDS)[number];

const MESSAGE_MAX = 5000;
const MESSAGE_MIN = 10;

const EMPTY = { name: '', email: '', subject: '', message: '' };

function validate(values: typeof EMPTY): FieldErrors<ContactField> {
    return {
        name: firstError(
            requiredText(values.name, 'họ tên'),
            maxLength(values.name, 100, 'Họ tên'),
        ),
        email: firstError(
            requiredText(values.email, 'email'),
            emailFormat(values.email),
            maxLength(values.email, 255, 'Email'),
        ),
        subject: maxLength(values.subject, 200, 'Tiêu đề'),
        message: firstError(
            requiredText(values.message, 'nội dung'),
            minLength(values.message, MESSAGE_MIN, 'Nội dung'),
            maxLength(values.message, MESSAGE_MAX, 'Nội dung'),
        ),
    };
}

export default function ContactPage() {
    useDocumentTitle('Liên hệ — Phạm Quốc Huân');

    const [values, setValues] = useState(EMPTY);
    const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverErrors, setServerErrors] = useState<FieldErrors<ContactField>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const clientErrors = validate(values);

    const errorFor = (field: ContactField): string | undefined =>
        serverErrors[field] ?? (touched[field] || submitted ? clientErrors[field] : undefined);

    const set = (field: ContactField) => (e: { target: { value: string } }) => {
        setValues((v) => ({ ...v, [field]: e.target.value }));
        // Người dùng sửa lại thì bỏ lỗi cũ từ server cho ô đó.
        setServerErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

    const blur = (field: ContactField) => () => setTouched((t) => ({ ...t, [field]: true }));

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (sending) return;

        setSubmitted(true);
        setSuccess(null);
        setFormError(null);
        setServerErrors({});

        if (FIELDS.some((f) => clientErrors[f])) return;

        setSending(true);
        try {
            const res = await sendContact({
                name: values.name.trim(),
                email: values.email.trim(),
                subject: values.subject.trim(),
                message: values.message.trim(),
            });
            setSuccess(res.message);
            setValues(EMPTY);
            setTouched({});
            setSubmitted(false);
        } catch (err) {
            if (isApiError(err) && err.is('VALIDATION_FAILED')) {
                const { fieldErrors, unmatched } = parseValidationMessage(err.message, FIELDS);
                setServerErrors(fieldErrors);
                if (unmatched.length > 0) setFormError(unmatched.join(' '));
            } else if (isApiError(err) && err.status === 429) {
                setFormError('Bạn gửi hơi nhiều, thử lại sau ít phút.');
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Không gửi được, vui lòng thử lại.');
            }
        } finally {
            setSending(false);
        }
    }

    const messageLength = values.message.length;
    const tooShort = messageLength > 0 && messageLength < MESSAGE_MIN;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Liên hệ</h1>
                <p className="text-zinc-400">
                    Có dự án hoặc câu hỏi? Gửi tin nhắn, hoặc email trực tiếp tới{' '}
                    <a href={`mailto:${site.email}`} className="text-accent hover:underline">
                        {site.email}
                    </a>
                    .
                </p>
            </header>

            {success && (
                <p
                    role="status"
                    className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300"
                >
                    {success}
                </p>
            )}

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
                    label="Họ tên"
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={values.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    error={errorFor('name')}
                />

                <Input
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={255}
                    value={values.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    error={errorFor('email')}
                />

                <Input
                    label="Tiêu đề"
                    maxLength={200}
                    value={values.subject}
                    onChange={set('subject')}
                    onBlur={blur('subject')}
                    error={errorFor('subject')}
                    hint={`${values.subject.length}/200`}
                />

                <Textarea
                    label="Nội dung"
                    required
                    rows={7}
                    maxLength={MESSAGE_MAX}
                    value={values.message}
                    onChange={set('message')}
                    onBlur={blur('message')}
                    error={errorFor('message')}
                    hint={
                        <span className={tooShort ? 'text-amber-400' : undefined}>
                            {messageLength}/{MESSAGE_MAX}
                            {tooShort && ` — cần ít nhất ${MESSAGE_MIN} ký tự`}
                        </span>
                    }
                />

                <div>
                    <Button type="submit" size="lg" loading={sending}>
                        {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

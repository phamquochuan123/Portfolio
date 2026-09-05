import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Field } from './Field';
import { CONTROL_CLASS, borderClass } from './controlStyles';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    label: string;
    error?: string;
    hint?: ReactNode;
    /** Node hiển thị đè lên mép phải của ô, ví dụ nút hiện/ẩn mật khẩu. */
    trailing?: ReactNode;
}

export function Input({ label, error, hint, trailing, className, required, ...rest }: InputProps) {
    const id = useId();
    return (
        <Field id={id} label={label} error={error} hint={hint} required={required}>
            <div className="relative">
                <input
                    id={id}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(CONTROL_CLASS, borderClass(!!error), !!trailing && 'pr-11', className)}
                    {...rest}
                />
                {trailing ? (
                    <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
                ) : null}
            </div>
        </Field>
    );
}

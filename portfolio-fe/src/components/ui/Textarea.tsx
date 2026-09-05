import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Field } from './Field';
import { CONTROL_CLASS, borderClass } from './controlStyles';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
    label: string;
    error?: string;
    hint?: ReactNode;
}

export function Textarea({ label, error, hint, className, required, rows = 5, ...rest }: TextareaProps) {
    const id = useId();
    return (
        <Field id={id} label={label} error={error} hint={hint} required={required}>
            <textarea
                id={id}
                rows={rows}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(CONTROL_CLASS, borderClass(!!error), 'resize-y', className)}
                {...rest}
            />
        </Field>
    );
}

import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Field } from './Field';
import { CONTROL_CLASS, borderClass } from './controlStyles';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
    label: string;
    options: SelectOption[];
    error?: string;
    hint?: ReactNode;
}

export function Select({ label, options, error, hint, className, required, ...rest }: SelectProps) {
    const id = useId();
    return (
        <Field id={id} label={label} error={error} hint={hint} required={required}>
            <select
                id={id}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(CONTROL_CLASS, borderClass(!!error), 'cursor-pointer', className)}
                {...rest}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </Field>
    );
}

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(
            'flex w-full rounded-lg border bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            error
              ? 'border-red-500 focus-visible:ring-red-400'
              : 'border-slate-300 focus-visible:border-violet-600 focus-visible:ring-violet-600',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start space-x-3 text-left">
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className={cn(
            'mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border-slate-300 text-violet-700',
            'focus:ring-2 focus:ring-violet-600 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            className
          )}
          {...props}
        />
        {label && (
          <div className="text-sm">
            <label htmlFor={checkboxId} className="font-medium text-slate-900 cursor-pointer select-none">
              {label}
            </label>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  className,
}) => {
  return (
    <div className={cn('space-y-2 text-left', className)} role="radiogroup">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-start space-x-3 rounded-lg border border-slate-200 bg-white p-3 cursor-pointer transition-colors',
            'hover:bg-slate-50',
            option.disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            disabled={option.disabled}
            defaultChecked={defaultValue === option.value}
            checked={value !== undefined ? value === option.value : undefined}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="mt-0.5 h-4 w-4 border-slate-300 text-violet-700 focus:ring-violet-600"
          />
          <div className="text-sm">
            <span className="font-medium text-slate-900">{option.label}</span>
            {option.description && <p className="text-xs text-slate-500">{option.description}</p>}
          </div>
        </label>
      ))}
    </div>
  );
};
RadioGroup.displayName = 'RadioGroup';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}) => {
  return (
    <label
      className={cn(
        'flex items-center justify-between cursor-pointer select-none space-x-3 py-1',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {label && (
        <div className="text-left text-sm">
          <span className="font-medium text-slate-900">{label}</span>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 min-w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2',
          checked ? 'bg-violet-700' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
};
Switch.displayName = 'Switch';


import { cloneElement, useId, type InputHTMLAttributes, type ReactElement } from "react";
import FieldError from "./FieldError";

// Связывает label ↔ input (htmlFor/id) и ошибку ↔ input (aria-describedby, aria-invalid)
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
}

export default function FormField({ label, required = false, error, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {cloneElement(children, {
        id,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      <FieldError id={errorId} msg={error} />
    </div>
  );
}

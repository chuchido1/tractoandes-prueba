import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  name: string;
  label: string;
  error?: string;
  children: ReactNode;
};

/** Etiqueta + control + mensaje de error. El control debe llevar id={name} y aria-describedby. */
export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function errorProps(name: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : undefined,
  } as const;
}

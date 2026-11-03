import type { ComponentProps } from "react";
import { errorProps, FormField } from "@/components/form-field";
import { Textarea } from "@/components/ui/textarea";

type TextareaFieldProps = Omit<ComponentProps<typeof Textarea>, "id"> & {
  name: string;
  label: string;
  error?: string;
};

export function TextareaField({
  name,
  label,
  error,
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <FormField name={name} label={label} error={error}>
      <Textarea id={name} name={name} {...errorProps(name, error)} {...textareaProps} />
    </FormField>
  );
}

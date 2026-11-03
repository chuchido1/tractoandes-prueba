import type { ComponentProps } from "react";
import { errorProps, FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";

type TextFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  name: string;
  label: string;
  error?: string;
};

export function TextField({ name, label, error, ...inputProps }: TextFieldProps) {
  return (
    <FormField name={name} label={label} error={error}>
      <Input id={name} name={name} {...errorProps(name, error)} {...inputProps} />
    </FormField>
  );
}

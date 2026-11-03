import { Alert, AlertDescription } from "@/components/ui/alert";

type FormAlertProps = {
  message: string;
  variant?: "default" | "destructive";
};

/** Aviso visible para errores (destructive) o mensajes informativos de un formulario. */
export function FormAlert({ message, variant = "destructive" }: FormAlertProps) {
  return (
    <Alert variant={variant} role={variant === "destructive" ? "alert" : "status"}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

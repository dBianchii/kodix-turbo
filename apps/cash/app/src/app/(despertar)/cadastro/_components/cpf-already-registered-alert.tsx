import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface CpfAlreadyRegisteredAlertProps {
  hasMissingOrDifferentFields: boolean;
}

export function CpfAlreadyRegisteredAlert({
  hasMissingOrDifferentFields,
}: CpfAlreadyRegisteredAlertProps) {
  if (hasMissingOrDifferentFields) {
    return (
      <Alert variant="default">
        <Info />
        <AlertTitle>Complete seu cadastro</AlertTitle>
        <AlertDescription>
          Seu CPF já está cadastrado, mas faltam algumas informações. Por favor,
          preencha os campos abaixo para completar seu cadastro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default">
      <AlertCircle />
      <AlertTitle>CPF já cadastrado</AlertTitle>
      <AlertDescription>
        O seu CPF já está cadastrado no nosso sistema. Você não precisa se
        cadastrar novamente. 🙏
      </AlertDescription>
    </Alert>
  );
}

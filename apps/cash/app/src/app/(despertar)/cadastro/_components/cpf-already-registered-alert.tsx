import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { AlertCircle } from "lucide-react";

interface CpfAlreadyRegisteredAlertProps {
  email: boolean;
  phone: boolean;
}

export function CpfAlreadyRegisteredAlert({
  email,
  phone,
}: CpfAlreadyRegisteredAlertProps) {
  const hasEmail = !!email;
  const hasPhone = !!phone;
  const hasBoth = hasEmail && hasPhone;

  let missingInfoMessage = "";
  if (!hasBoth) {
    if (!(hasEmail || hasPhone)) {
      missingInfoMessage =
        "No entanto, seu cadastro está sem e-mail e telefone. Peça ao atendente do caixa para adicionar essas informações no sistema.";
    } else if (hasEmail) {
      missingInfoMessage =
        "No entanto, seu cadastro está sem telefone. Peça ao atendente do caixa para adicionar essa informação no sistema.";
    } else {
      missingInfoMessage =
        "No entanto, seu cadastro está sem e-mail. Peça ao atendente do caixa para adicionar essa informação no sistema.";
    }
  }

  return (
    <Alert variant="default">
      <AlertCircle />
      <AlertTitle>CPF já cadastrado</AlertTitle>
      <AlertDescription>
        O seu CPF já está cadastrado no nosso sistema. Você não precisa se
        cadastrar novamente. 🙏
        {missingInfoMessage && (
          <>
            <br />
            {missingInfoMessage}
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}

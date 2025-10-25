import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

export function CadastroSuccess({ onReset }: { onReset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-green-500">
            Obrigado por se registrar no programa de cashback!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Seus dados foram salvos e você começará a acumular cashback em suas
            próximas compras. Em breve, você receberá mais informações no email
            cadastrado.
          </p>
          <Button className="mt-6 w-full" onClick={onReset} variant="default">
            Fazer outro cadastro
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

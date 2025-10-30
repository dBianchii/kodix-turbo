"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import DespertarLogo from "./_assets/despertar-logo.png";
import { CadastroForm } from "./_components/cadastro-form";

export default function CadastroPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4 px-2">
      <Image
        alt="Logo do Despertar"
        className="mx-auto mb-3"
        height={100}
        loading="eager"
        src={DespertarLogo}
        style={{ width: "auto" }}
        width={100}
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Participe do programa de cashback</CardTitle>
        </CardHeader>
        <CardContent>
          <CadastroForm />
        </CardContent>
      </Card>
    </main>
  );
}

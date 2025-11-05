"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import DespertarLogo from "./_assets/despertar-logo.png";
import { CadastroSuccess } from "./_components/cadastro-success";
import { RegistrationForm } from "./_components/registration-form";

export default function CadastroPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return <CadastroSuccess onReset={() => setIsSuccess(false)} />;
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-2 py-8 pb-12">
      <Image
        alt="Logo do Despertar"
        className="mb-6"
        height={100}
        src={DespertarLogo}
        width={100}
      />

      <Card className="w-full md:max-w-md">
        <CardHeader>
          <CardTitle>Participe do programa de cashback</CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationForm onSuccess={() => setIsSuccess(true)} />
        </CardContent>
      </Card>
    </main>
  );
}

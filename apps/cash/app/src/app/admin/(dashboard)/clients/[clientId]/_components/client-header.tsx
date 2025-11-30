"use client";

import Link from "next/link";
import { Button } from "@kodix/ui/button";
import { ArrowLeft } from "lucide-react";

import { useGetClientByIdSuspenseQuery } from "./utils/use-get-client-by-id-query";

export function ClientHeader() {
  const { data } = useGetClientByIdSuspenseQuery();

  return (
    <div className="flex items-center gap-4">
      <Button asChild size="icon" variant="ghost">
        <Link href="/admin/clients">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div>
        <h1 className="font-bold text-2xl tracking-tight">
          {data.client.name}
        </h1>
        <p className="text-muted-foreground">{data.client.email}</p>
      </div>
    </div>
  );
}

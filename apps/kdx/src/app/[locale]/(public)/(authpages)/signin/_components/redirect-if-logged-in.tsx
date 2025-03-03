"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

export function RedirectIfLoggedIn() {
  const api = useTRPC();
  const router = useRouter();
  const logged = useQuery(
    api.auth.getSession.queryOptions(undefined, {
      refetchOnMount: true,
    }),
  );
  useEffect(() => {
    if (logged.data?.session) router.replace("/team");
  }, [logged.data, router]);
  return null;
}

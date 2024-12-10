"use client";

import { useEffect } from "react";

import { useRouter } from "~/i18n/routing";
import { api } from "~/trpc/react";

export function RedirectIfLoggedIn() {
  const router = useRouter();
  const logged = api.auth.getSession.useQuery(undefined, {
    refetchOnMount: true,
  });
  useEffect(() => {
    if (logged.data?.session) router.replace("/team");
  }, [logged.data, router]);
  return null;
}

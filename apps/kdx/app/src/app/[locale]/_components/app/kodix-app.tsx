"use client";

import type { KodixAppId } from "@kodix/shared/db";
import { useState } from "react";
import Image from "next/image";
import { kodixCareAppId, todoAppId } from "@kodix/shared/db";
import { cn } from "@kodix/ui";
import { Badge } from "@kodix/ui/badge";
import { Button, buttonVariants } from "@kodix/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kodix/ui/card";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/credenza";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { Skeleton } from "@kodix/ui/skeleton";
import { toast } from "@kodix/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuTrash } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { getAppDescription, getAppName } from "@kdx/locales/next-intl/hooks";

import {
  getAppIconUrl,
  getAppUrl,
  trpcErrorToastDefault,
} from "~/helpers/miscelaneous";
import { Link, useRouter } from "~/i18n/routing";

export function KodixApp({
  id,
  installed,
  user,
}: {
  id: KodixAppId;
  installed: boolean;
  user: User | null;
}) {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const installAppMutation = useMutation(
    trpc.app.installApp.mutationOptions({
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
        void queryClient.invalidateQueries(trpc.app.getInstalled.pathFilter());
        router.refresh();
        toast.success(`${t("App")} ${appName} ${t("installed").toLowerCase()}`);
      },
    }),
  );
  const uninstallAppMutation = useMutation(
    trpc.app.uninstallApp.mutationOptions({
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
      onSuccess: () => {
        setOpen(false);
        void queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
        router.refresh();
        toast.success(
          `${t("App")} ${appName} ${t("uninstalled").toLowerCase()}`,
        );
      },
    }),
  );

  const appShouldGoToOnboarding = id === kodixCareAppId;

  const appurl = getAppUrl(id);
  const appIconUrl = getAppIconUrl(id);
  const appName = getAppName(id, t);
  const appDescription = getAppDescription(id, t);

  if (id === todoAppId) return null;

  return (
    <Card className="flex h-64 flex-col">
      <CardHeader className="pb-1">
        <div className="mb-4 flex justify-between">
          <Image
            alt={`${appName} logo`}
            height={50}
            src={appIconUrl}
            width={50}
          />
          {installed ? (
            <Badge className="h-5" variant={"green"}>
              {t("Installed")}
            </Badge>
          ) : null}
        </div>
        <CardTitle>{appName}</CardTitle>
      </CardHeader>
      <CardContent className="grow">
        <CardDescription className="line-clamp-3">
          {appDescription}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        {user && installed && (
          <Link
            className={cn(buttonVariants({ variant: "default" }))}
            href={appurl}
          >
            {t("Open")}
          </Link>
        )}
        {user && !installed && (
          <Button
            className={cn("disabled")}
            loading={installAppMutation.isPending}
            onClick={() => {
              if (appShouldGoToOnboarding) {
                router.push(`${appurl}/onboarding`);
                return;
              }
              void installAppMutation.mutate({ appId: id });
            }}
            variant={"secondary"}
          >
            {t("Install")}
          </Button>
        )}
        {!user && (
          <Link
            className={cn(buttonVariants({ variant: "default" }))}
            href="/signin"
          >
            {t("Install")}
          </Link>
        )}
        {/* <Button variant={"outline"} className="flex-none">
            <Trash2 className="text-destructive size-4" />
          </Button> */}
        {installed && (
          <Credenza onOpenChange={setOpen} open={open}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="ml-auto" size="sm" variant="ghost">
                  <RxDotsHorizontal className="size-4" />
                  <span className="sr-only">{t("open-dialog")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <CredenzaTrigger asChild>
                  <DropdownMenuItem>
                    <LuTrash className="mr-2 size-4 text-destructive" />
                    <span>{t("Uninstall from team")}</span>
                  </DropdownMenuItem>
                </CredenzaTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <CredenzaContent>
              <CredenzaHeader>
                <CredenzaTitle>{t("confirm")}</CredenzaTitle>
                <CredenzaDescription className="py-4">
                  {t("are-you-sure-you-would-like-to-uninstall")} {appName}{" "}
                  {t("From").toLowerCase()}
                  {` ${user?.activeTeamName}`}
                  {t("questionmark")}
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaFooter className="gap-3 sm:justify-between">
                <Button
                  disabled={uninstallAppMutation.isPending}
                  onClick={() => setOpen(false)}
                  variant="outline"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  loading={uninstallAppMutation.isPending}
                  onClick={() => {
                    uninstallAppMutation.mutate({ appId: id });
                  }}
                  variant="destructive"
                >
                  {t("Uninstall")}
                </Button>
              </CredenzaFooter>
            </CredenzaContent>
          </Credenza>
        )}
      </CardFooter>
    </Card>
  );
}

export function AppCardSkeleton() {
  return (
    <Card className="flex h-64 flex-col">
      <CardHeader className="pb-1">
        <div className="mb-4 flex justify-between">
          <Skeleton className="h-[50px] w-[50px] rounded-md" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-2/4" />
      </CardHeader>
      <CardContent className="grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}

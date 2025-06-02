"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuInfo, LuTrash } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { User } from "@kdx/auth";
import type { KodixAppId } from "@kdx/shared";
import { getAppDescription, getAppName } from "@kdx/locales/next-intl/hooks";
import { getAppDependencies, kodixCareAppId, todoAppId } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Badge } from "@kdx/ui/badge";
import { Button, buttonVariants } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { Skeleton } from "@kdx/ui/skeleton";
import { toast } from "@kdx/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import {
  getAppIconUrl,
  getAppUrl,
  trpcErrorToastDefault,
} from "~/helpers/miscelaneous";
import {
  Link as RoutingLink,
  useRouter as useRoutingRouter,
} from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

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
  const router = useRoutingRouter();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const dependencies = getAppDependencies(id);
  const hasDependencies = dependencies.length > 0;

  const installAppMutation = useMutation(
    trpc.app.installApp.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
        void queryClient.invalidateQueries(trpc.app.getInstalled.pathFilter());
        router.refresh();

        if (hasDependencies) {
          const dependencyNames = dependencies
            .map((depId: KodixAppId) => getAppName(depId, t))
            .join(", ");
          toast.success(
            `${t("App")} ${appName} ${t("installed").toLowerCase()} (com dependências: ${dependencyNames})`,
          );
        } else {
          toast.success(
            `${t("App")} ${appName} ${t("installed").toLowerCase()}`,
          );
        }
      },
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
    }),
  );
  const uninstallAppMutation = useMutation(
    trpc.app.uninstallApp.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        void queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
        router.refresh();
        toast.success(
          `${t("App")} ${appName} ${t("uninstalled").toLowerCase()}`,
        );
      },
      onError: (err) => {
        trpcErrorToastDefault(err);
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
            src={appIconUrl}
            height={50}
            width={50}
            alt={`${appName} logo`}
          />
          {installed ? (
            <Badge variant={"green"} className="h-5">
              {t("Installed")}
            </Badge>
          ) : null}
        </div>
        <CardTitle>{appName}</CardTitle>
      </CardHeader>
      <CardContent className="grow">
        <CardDescription className="line-clamp-3">
          {appDescription}

          {!installed && hasDependencies && (
            <div className="text-muted-foreground mt-2 border-t pt-2 text-xs">
              <strong>Requer:</strong>{" "}
              {dependencies
                .map((depId: KodixAppId) => getAppName(depId, t))
                .join(", ")}
            </div>
          )}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        {user && installed && (
          <Link
            href={appurl}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            {t("Open")}
          </Link>
        )}
        {user && !installed && (
          <Button
            loading={installAppMutation.isPending}
            onClick={() => {
              if (appShouldGoToOnboarding) {
                router.push(`${appurl}/onboarding`);
                return;
              }
              void installAppMutation.mutate({ appId: id });
            }}
            variant={"secondary"}
            className={cn("disabled")}
          >
            {t("Install")}
          </Button>
        )}
        {!user && (
          <Link
            href="/signin"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            {t("Install")}
          </Link>
        )}
        {/* <Button variant={"outline"} className="flex-none">
            <Trash2 className="text-destructive size-4" />
          </Button> */}
        {installed && (
          <Credenza open={open} onOpenChange={setOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <RxDotsHorizontal className="size-4" />
                  <span className="sr-only">{t("open-dialog")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <CredenzaTrigger asChild>
                  <DropdownMenuItem>
                    <LuTrash className="text-destructive mr-2 size-4" />
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
                  {" " + user?.activeTeamName}
                  {t("questionmark")}
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaFooter className="gap-3 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uninstallAppMutation.isPending}
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

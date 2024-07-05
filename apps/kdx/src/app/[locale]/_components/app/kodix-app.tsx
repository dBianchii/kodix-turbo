"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";
import { RxDotsHorizontal, RxTrash } from "react-icons/rx";

import type { User } from "@kdx/auth";
import type { KodixAppId } from "@kdx/shared";
import { useI18n } from "@kdx/locales/client";
import { useAppDescription, useAppName } from "@kdx/locales/hooks";
import { kodixCareAppId } from "@kdx/shared";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { toast } from "@kdx/ui/toast";

import {
  getAppIconUrl,
  getAppUrl,
  trpcErrorToastDefault,
} from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function KodixApp({
  id,
  installed,
  user,
}: {
  id: KodixAppId;
  installed: boolean;
  user: User | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const t = useI18n();
  const installAppMutation = api.app.installApp.useMutation({
    onSuccess: () => {
      void utils.app.getAll.invalidate();
      void utils.app.getInstalled.invalidate();
      router.refresh();
      toast.success(`${t("App")} ${appName} ${t("installed").toLowerCase()}`);
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });
  const uninstallAppMutation = api.app.uninstallApp.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.getAll.invalidate();
      router.refresh();
      toast.success(`${t("App")} ${appName} ${t("uninstalled").toLowerCase()}`);
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });

  const appShouldGoToOnboarding = id === kodixCareAppId;

  const appurl = getAppUrl(id);
  const appIconUrl = getAppIconUrl(id);
  const appName = useAppName(id);
  const appDescription = useAppDescription(id);

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
            disabled={installAppMutation.isPending}
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
            {installAppMutation.isPending && (
              <LuLoader2 className="mr-2 size-5 animate-spin" />
            )}
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <RxDotsHorizontal className="size-4" />
                  <span className="sr-only">{t("open-dialog")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <RxTrash className="mr-2 size-4 text-destructive" />
                    <span>{t("Uninstall from team")}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("confirm")}</DialogTitle>
                <DialogDescription className="py-4">
                  {t("are-you-sure-you-would-like-to-uninstall")} {appName}{" "}
                  {t("From").toLowerCase()}
                  {" " + user?.activeTeamName}
                  {t("questionmark")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uninstallAppMutation.isPending}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  disabled={uninstallAppMutation.isPending}
                  onClick={() => {
                    uninstallAppMutation.mutate({ appId: id });
                  }}
                  variant="destructive"
                >
                  {uninstallAppMutation.isPending && (
                    <LuLoader2 className="mr-2 size-5 animate-spin" />
                  )}
                  {t("Uninstall")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

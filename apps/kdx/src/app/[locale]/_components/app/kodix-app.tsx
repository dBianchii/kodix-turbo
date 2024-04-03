"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";
import { RxDotsHorizontal, RxTrash } from "react-icons/rx";

import type { Session } from "@kdx/auth";
import type { KodixAppId } from "@kdx/shared";
import {
  useAppDescription,
  useAppName,
} from "@kdx/locales/translation-getters";
import { kodixCareAppId } from "@kdx/shared";
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
import { cn } from "@kdx/ui/utils";

import { getAppIconUrl, getAppUrl } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

interface KodixAppProps {
  id: KodixAppId;
  installed: boolean;
  session: Session | null;
}

export function KodixApp({ id, installed, session }: KodixAppProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const installAppMutation = api.team.installApp.useMutation({
    onSuccess: () => {
      void utils.app.getAll.invalidate();
      router.refresh();
      toast(`App ${appName} installed`);
    },
  });
  const uninstallAppMutation = api.team.uninstallApp.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.getAll.invalidate();
      router.refresh();
      toast.success(`App ${appName} uninstalled`);
    },
    onError: () => {
      toast.error(`Error uninstalling ${appName}`);
    },
  });

  const isActive = true;
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
              Installed
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
      <CardFooter>
        {session && installed && (
          <Link
            href={appurl}
            className={cn(
              buttonVariants({ variant: "default" }),
              !isActive && "pointer-events-none opacity-50",
            )}
          >
            {isActive ? "Open" : "Coming soon"}
          </Link>
        )}
        {session && !installed && (
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
            className={cn(
              "disabled",
              !isActive && "pointer-events-none opacity-50",
            )}
          >
            {installAppMutation.isPending && (
              <LuLoader2 className="mr-2 size-5 animate-spin" />
            )}
            {isActive ? "Install" : "Coming soon"}
          </Button>
        )}
        {!session && (
          <Link
            href="/signin"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Install
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
                  <span className="sr-only">Open dialog</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <RxTrash className="mr-2 size-4 text-destructive" />
                    <span>Uninstall from team</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm</DialogTitle>
                <DialogDescription className="py-4">
                  Are you sure you would like to uninstall {appName} from
                  {" " + session?.user.activeTeamName}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uninstallAppMutation.isPending}
                >
                  Cancel
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
                  Uninstall
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

import type { Session } from "@kdx/auth";
import type { KodixAppId } from "@kdx/shared";
import { getAppDescription, getAppName, kodixCareAppId } from "@kdx/shared";
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
  const [uninstalling, setUninstalling] = useState(false);
  const [installing, setInstalling] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { mutate } = api.team.installApp.useMutation({
    onMutate: () => {
      setInstalling(true);
    },
    onSuccess: () => {
      void utils.app.getAll.invalidate();
      router.refresh();
      toast(`App ${appName} installed`);
    },
    onSettled: () => {
      setInstalling(false);
    },
  });
  const { mutate: uninstall } = api.team.uninstallApp.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.getAll.invalidate();
      setUninstalling(false);
      router.refresh();
      toast(`App ${appName} uninstalled`);
    },
  });

  const isActive = true;
  const appShouldGoToOnboarding = id === kodixCareAppId;

  const appurl = getAppUrl(id);
  const appIconUrl = getAppIconUrl(id);
  const appName = getAppName(id);
  const appDescription = getAppDescription(id);

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
          {appDescription} Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Placeat inventore ullam recusandae laboriosam velit et neque,
          asperiores magnam. Ut harum corporis facilis nemo hic repudiandae
          voluptatum minus ea ad commodi.
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
            disabled={installing}
            onClick={() => {
              if (appShouldGoToOnboarding) {
                setInstalling(true);
                router.push(`${appurl}/onboarding`);
                setInstalling(false);
                return;
              }
              void mutate({ appId: id });
            }}
            variant={"secondary"}
            className={cn(
              "disabled",
              !isActive && "pointer-events-none opacity-50",
            )}
          >
            {installing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
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
            <Trash2 className="text-destructive h-4 w-4" />
          </Button> */}
        {installed && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open dialog</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
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
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uninstalling}
                >
                  Cancel
                </Button>
                <Button
                  disabled={uninstalling}
                  onClick={() => {
                    void uninstall({ appId: id });
                    setUninstalling(true);
                  }}
                  variant="destructive"
                >
                  {uninstalling && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

export function IconKodixApp({
  renderText = true,
  size = 80,
  ...props
}: {
  appId: KodixAppId;
  renderText?: boolean;
  size?: number;
}) {
  const appIconUrl = getAppIconUrl(props.appId);
  const appName = getAppName(props.appId);

  return (
    <>
      <Image
        src={appIconUrl}
        height={size}
        width={size}
        alt={`${appName} icon`}
      />
      {renderText && <p className="text-sm text-muted-foreground">{appName}</p>}
    </>
  );
}

export function CustomKodixIcon({
  renderText = true,
  ...props
}: {
  appUrl: string;
  appName: string;
  renderText?: boolean;
  iconPath: string;
}) {
  return (
    <Link href={props.appUrl} className="flex flex-col items-center">
      <Image
        src={props.iconPath}
        height={"80"}
        width={"80"}
        alt={`${props.appName} icon`}
      />
      {renderText && (
        <p className="text-sm text-muted-foreground">{props.appName}</p>
      )}
    </Link>
  );
}

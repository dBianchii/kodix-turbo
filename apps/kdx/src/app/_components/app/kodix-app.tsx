"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

import type { Session } from "@kdx/auth";
import type { KodixApp as KodixAppType } from "@kdx/db";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";

interface KodixAppProps {
  variant?: "rich" | "icon";
  id: string;
  appName: KodixAppType["name"];
  appDescription: string;
  appUrl: KodixAppType["url"];
  installed: boolean;
  session: Session | null;
}

export function KodixApp(props: KodixAppProps) {
  if (props.variant === "icon") return <IconKodixApp {...props} />;
  if (props.variant === "rich") return <RichKodixApp {...props} />;
}

function IconKodixApp(props: {
  appUrl: KodixAppProps["appUrl"];
  appName: KodixAppProps["appName"];
}) {
  return (
    <Link href={`/apps/${props.appUrl}`} className="flex flex-col items-center">
      <Image
        src={`/appIcons${props.appUrl}.png`}
        height={60}
        width={60}
        alt={`${props.appName} icon`}
      />
      <p className="text-muted-foreground text-sm">{props.appName}</p>
    </Link>
  );
}

function RichKodixApp({
  id,
  appName,
  appDescription,
  appUrl,
  installed,
  session,
}: Omit<KodixAppProps, "variant">) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { mutate } = api.workspace.installApp.useMutation({
    onSuccess: () => {
      void utils.app.getAll.invalidate();
      router.refresh();
      toast(`App ${appName} installed`);
    },
  });
  const { mutate: uninstall } = api.workspace.uninstallApp.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.getAll.invalidate();
      setLoading(false);
      router.refresh();
      toast(`App ${appName} uninstalled`);
    },
  });

  const isActive = true; //["KodixCare"].includes(appName);

  return (
    <Card className="w-[250px]">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Image
          src={`/appIcons${appUrl}.png`}
          height={30}
          width={30}
          alt={`${appName} icon`}
        />
        <CardTitle className="ml-2">{appName}</CardTitle>
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
                    <Trash2 className="text-destructive mr-2 h-4 w-4" />
                    <span>Uninstall from workspace</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm</DialogTitle>
                <DialogDescription className="py-4">
                  Are you sure you would like to uninstall {appName} from
                  {" " + session?.user.activeWorkspaceName}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    void uninstall({ appId: id });
                    setLoading(true);
                  }}
                  variant="destructive"
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Uninstall
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{appDescription}</CardDescription>
        <div className="flex w-full flex-col">
          {session && installed && (
            <Link
              href={`apps${appUrl}`}
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
              onClick={() => void mutate({ appId: id })}
              variant={"secondary"}
              className={cn(
                "disabled",
                !isActive && "pointer-events-none opacity-50",
              )}
            >
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
        </div>
      </CardContent>
    </Card>
  );
}

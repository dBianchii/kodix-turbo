"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

import type { Session } from "@kdx/auth";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export function KodixApp({
  id,
  appName,
  appDescription,
  appUrl,
  installed,
  session,
}: {
  id: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  installed: boolean;
  session: Session | null;
}) {
  const [open, onOpenChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate } = api.workspace.installApp.useMutation({
    onSuccess: () => {
      void ctx.app.getAll.invalidate();
      toast(`App ${appName} installed`);
    },
  });
  const { mutate: uninstall } = api.workspace.uninstallApp.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      void ctx.app.getAll.invalidate();
      setLoading(false);
      toast(`App ${appName} uninstalled`);
    },
  });

  return (
    <>
      <Card className="max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="">{appName} </CardTitle>

          {installed && (
            <Dialog open={open} onOpenChange={onOpenChange}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="">
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
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      void uninstall({ appId: id });
                      setLoading(true);
                    }}
                    variant="destructive"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
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
            {!session ? (
              <Link
                href="/signin"
                className={buttonVariants({ variant: "default" })}
              >
                Install
              </Link>
            ) : installed ? (
              <Link
                href={`apps${appUrl}`}
                className={buttonVariants({ variant: "default" })}
              >
                Open
              </Link>
            ) : (
              <Button onClick={() => void mutate({ appId: id })}>
                Install
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

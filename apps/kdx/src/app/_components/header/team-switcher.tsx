"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  AvatarWrapper,
  Button,
  buttonVariants,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@kdx/ui";

import { api } from "~/trpc/react";
import { getBaseUrl } from "~/trpc/shared";
import { AddWorkspaceDialog } from "./add-workspace-dialog";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

type TeamSwitcherProps = PopoverTriggerProps;

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const session = useSession();
  const utils = api.useUtils();
  const router = useRouter();
  const pathName = usePathname();
  const { isPending, mutateAsync: switchActiveWorkspace } =
    api.user.switchActiveWorkspace.useMutation();

  const { data } = api.workspace.getAllForLoggedUser.useQuery();

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  if (!session.data) return null;
  if (!data) return null;

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="center flex justify-center rounded-lg">
          <Link
            href={
              isPending
                ? "#"
                : `/workspace/${data?.activeWorkspaceUrl}/settings`
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-start hover:bg-inherit",
              className,
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <Skeleton className="mx-3 h-3 w-full" />
              </>
            ) : (
              <>
                <AvatarWrapper
                  className="mr-2 h-5 w-5"
                  src={`${getBaseUrl()}/api/avatar/${data?.activeWorkspaceName}`}
                  alt={data?.activeWorkspaceName}
                  fallback={data?.activeWorkspaceName}
                />
                {data?.activeWorkspaceName.length > 19 ? (
                  <span className="text-xs">{data?.activeWorkspaceName}</span>
                ) : (
                  data?.activeWorkspaceName
                )}
              </>
            )}
          </Link>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a workspace"
              disabled={isPending}
              className="w-8"
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup>
                {data.workspaces.map((ws) => (
                  <CommandItem
                    key={ws.name}
                    value={ws.name + ws.id} //
                    onSelect={async () => {
                      setOpen(false);
                      const newActiveWorkspace = await switchActiveWorkspace({
                        workspaceId: ws.id,
                      });
                      void utils.workspace.getAllForLoggedUser.invalidate();

                      //find in string where old data.url is, and replace it with new url
                      const newUrl = pathName?.replace(
                        data.activeWorkspaceUrl,
                        newActiveWorkspace.url,
                      );
                      router.push(newUrl ?? "/");
                      router.refresh();
                    }}
                    className="text-sm"
                  >
                    <AvatarWrapper
                      className="mr-2 h-5 w-5"
                      src={`${getBaseUrl()}/api/avatar/${ws.name}`}
                      alt={ws.name}
                    />
                    {ws.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        data?.activeWorkspaceId === ws.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewWorkspaceDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Workspace
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </AddWorkspaceDialog>
  );
}

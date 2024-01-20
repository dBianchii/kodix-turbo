"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";

import type { Session } from "@kdx/auth";
import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { toast } from "@kdx/ui/toast";
import { cn } from "@kdx/ui/utils";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { createTeamAction } from "./actions";

export function AddTeamDialogButton({
  session,
  children,
  className,
}: {
  session: Session;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [teamName, changeTeamName] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ?? (
        <DialogTrigger asChild>
          <Button className={cn(className)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Team
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Create a new team and invite your team members
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={teamName}
                onChange={(e) => changeTeamName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={async () => {
              setIsPending(true);
              const result = await createTeamAction({
                userId: session.user.id,
                teamName: teamName,
              });
              setIsPending(false);
              if (defaultSafeActionToastError(result)) return;
              setOpen(false);
              toast(`Team ${result.data?.name} created`, {
                description: "Successfully created a new team.",
              });
              return router.refresh();
            }}
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

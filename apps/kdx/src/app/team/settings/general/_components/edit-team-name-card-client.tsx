"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { updateTeamSchema } from "@kdx/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  toast,
} from "@kdx/ui";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function EditTeamNameCardClient({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const { mutate, isPending } = api.team.update.useMutation({
    onSuccess: () => {
      toast.success("Team name updated successfully");
      router.refresh();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  const [newName, setNewName] = useState(teamName);

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>Team Name</CardTitle>
        <CardDescription>This is your team&apos;s visible name</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={newName}
              onChange={(e) => {
                if (e.target.value.length <= 32) setNewName(e.target.value);
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="">Please use 32 characters at maximum.</p>
        <Button
          disabled={isPending}
          onClick={() => {
            const values = {
              teamId,
              teamName: newName,
            };
            const parsed = updateTeamSchema.safeParse(values);
            if (!parsed.success) {
              return toast.error(parsed.error.errors[0]?.message);
            }
            mutate(values);
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            <>Save</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

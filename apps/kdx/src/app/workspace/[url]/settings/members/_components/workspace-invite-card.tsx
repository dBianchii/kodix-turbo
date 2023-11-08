"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Link, Loader2, MinusCircle, PlusCircle } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
} from "@kdx/ui";

import { api } from "~/trpc/react";

export default function WorkspaceInviteCard() {
  const [email, setEmail] = useState("");

  const { mutate, isPending } = api.workspace.inviteUser.useMutation({});

  const [emails, setEmails] = useState([""]);
  const [parent] = useAutoAnimate();

  return (
    <Card className="w-full text-left">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardDescription>Invite new members by email address</CardDescription>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
              <Link className="mr-2 h-4 w-4" />
              Invite Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <DialogFooter></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Separator className="mb-6" />
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email-0" className="text-muted-foreground mb-1">
              Email Address
            </Label>
            <div ref={parent} className="space-y-2">
              {emails.map((email, index) => (
                <div key={"email" + index} className="flex flex-row space-x-1">
                  <Input
                    id={`email-${index}`}
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...emails];
                      newEmails[index] = e.target.value;
                      setEmails(newEmails);
                    }}
                    placeholder={"layla@gmail.com"}
                  />
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    className="items-center justify-center"
                    onClick={() => {
                      const newEmails = [...emails];
                      newEmails.splice(index, 1);
                      setEmails(newEmails);
                    }}
                  >
                    <MinusCircle className="h-4 w-4 " />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <Button
            variant={"secondary"}
            size={"sm"}
            className="h-8 p-2 text-xs"
            onClick={() => {
              const newEmails = [...emails];
              newEmails.push("");
              setEmails(newEmails);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add more
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        <Button
          disabled={isPending}
          onClick={() => {
            // const values = {
            //   workspaceId,
            //   workspaceUrl: email,
            // };
            // const parsed = updateWorkspaceSchema.safeParse(values);
            // if (!parsed.success) {
            //   return toast.error(parsed.error.errors[0]?.message);
            // }
            // mutate(values);
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inviting
            </>
          ) : (
            <>Invite</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

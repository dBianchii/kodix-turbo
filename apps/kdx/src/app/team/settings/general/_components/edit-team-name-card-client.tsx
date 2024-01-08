"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { toast } from "@kdx/ui/toast";
import { updateTeamSchema } from "@kdx/validators";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function EditTeamNameCardClient({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const form = useForm({
    schema: updateTeamSchema,
    defaultValues: {
      teamId,
      teamName,
    },
  });

  const router = useRouter();
  const { mutate, isPending } = api.team.update.useMutation({
    onSuccess: () => {
      toast.success("Team name updated successfully");
      router.refresh();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  return (
    <Card className="w-full text-left">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            mutate(data);
          })}
        >
          <CardHeader>
            <CardTitle>Team Name</CardTitle>
            <CardDescription>
              This is your team&apos;s visible name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="">Please use 32 characters at maximum.</p>
            <Button disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

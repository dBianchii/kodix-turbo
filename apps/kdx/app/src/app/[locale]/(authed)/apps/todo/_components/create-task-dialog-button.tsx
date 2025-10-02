"use client";

import { useState } from "react";
import { AvatarWrapper } from "@kodix/ui/avatar-wrapper";
import { Button } from "@kodix/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/credenza";
import { Input } from "@kodix/ui/input";
import { PopoverTrigger } from "@kodix/ui/popover";
import { Textarea } from "@kodix/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { HiUserCircle } from "react-icons/hi";
import { LuPlus, LuX } from "react-icons/lu";

import type { todos } from "@kdx/db/schema";
import { useTRPC } from "@kdx/api/trpc/react/client";

import {
  DatePickerIcon,
  DatePickerWithPresets,
} from "~/app/[locale]/_components/date-picker-with-presets";

import type { Priority } from "./priority-popover";
import { AssigneePopover } from "./assignee-popover";
import {
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "./priority-popover";
import { StatusPopover } from "./status-popover";

type Status = typeof todos.$inferInsert.status;

export function CreateTaskDialogButton() {
  const trpc = useTRPC();
  function handleCreateTask() {
    createTask({
      title,
      description,
      status,
      dueDate,
      priority,
      assignedToUserId,
    });
    setOpen(false);
  }

  const queryClient = useQueryClient();
  const { mutate: createTask } = useMutation(
    trpc.app.todo.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.app.todo.getAll.pathFilter());
      },
    }),
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<Priority>(0);
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>("");

  // const { data: team } = api.team.getActiveTeam.useQuery();
  const team = {
    Users: [{ id: "THIS_WAS_REMOVED_LOL", name: "asdas", image: "asd" }],
  };

  const [open, setOpen] = useState(false);

  const user = team.Users.find((x) => x.id === assignedToUserId);
  const t = useTranslations();
  const format = useFormatter();

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="sm">
          <LuPlus className="mr-2 size-4" />
          {t("Create task")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="mb-64 sm:max-w-[600px]">
        <CredenzaHeader>
          <CredenzaTitle>New Task</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <Input
            className="my-2 border-none"
            type="text"
            placeholder="Event title..."
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            className="my-2 border-none"
            placeholder="Add description..."
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-row gap-1">
            <StatusPopover setStatus={setStatus} status={status} />
            <PriorityPopover priority={priority} setPriority={setPriority}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <PriorityIcon priority={priority} className={"mr-2"} />
                  {PriorityToTxt(priority)}
                  <span className="sr-only">Open priority popover</span>
                </Button>
              </PopoverTrigger>
            </PriorityPopover>
            <AssigneePopover
              assignedToUserId={assignedToUserId}
              setAssignedToUserId={setAssignedToUserId}
              users={team.Users}
            >
              <Button variant="outline" size="sm">
                <span className="sr-only">Open assign user popover</span>

                {user ? (
                  <>
                    <AvatarWrapper
                      className="mr-2 size-4"
                      src={user.image}
                      alt={`${user.name} avatar`}
                      fallback={<HiUserCircle />}
                    />
                    {user.name}
                  </>
                ) : (
                  <>
                    <HiUserCircle className="mr-2 size-4" />
                    {t("Assignee")}
                  </>
                )}
              </Button>
            </AssigneePopover>
            <DatePickerWithPresets date={dueDate} setDate={setDueDate}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    !dueDate ? "text-muted-foreground" : "text-foreground"
                  }
                  size="sm"
                >
                  <DatePickerIcon date={dueDate} className="mr-2 size-4" />
                  {dueDate
                    ? format.dateTime(dueDate, "extensive")
                    : t("Pick a date")}
                  {dueDate && (
                    // biome-ignore lint/a11y/noStaticElementInteractions: <biome migration>
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <biome migration>
                    <span
                      onClick={() => {
                        setDueDate(undefined);
                      }}
                      className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
                    >
                      <LuX className="size-4" />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
            </DatePickerWithPresets>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button type="submit" size="sm" onClick={handleCreateTask}>
            {t("Create task")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

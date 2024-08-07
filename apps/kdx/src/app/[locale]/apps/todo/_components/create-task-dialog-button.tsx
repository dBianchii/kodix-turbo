"use client";

import { useState } from "react";
import { HiUserCircle } from "react-icons/hi";
import { RxCross2, RxPlus } from "react-icons/rx";

import type { todos } from "@kdx/db/schema";
import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
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
import { PopoverTrigger } from "@kdx/ui/popover";
import { Textarea } from "@kdx/ui/textarea";

import type { Priority } from "~/app/[locale]/apps/todo/_components/priority-popover";
import {
  DatePickerIcon,
  DatePickerWithPresets,
} from "~/app/[locale]/_components/date-picker-with-presets";
import {
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "~/app/[locale]/apps/todo/_components/priority-popover";
import { StatusPopover } from "~/app/[locale]/apps/todo/_components/status-popover";
import { api } from "~/trpc/react";
import { AssigneePopover } from "./assignee-popover";

type Status = typeof todos.$inferInsert.status;

export function CreateTaskDialogButton() {
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

  const utils = api.useUtils();
  const { mutate: createTask } = api.app.todo.create.useMutation({
    onSuccess: () => {
      void utils.app.todo.getAll.invalidate();
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<Priority>(0);
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>("");

  const { data: team } = api.team.getActiveTeam.useQuery();

  const [open, setOpen] = useState(false);

  const user = (team?.Users ?? []).find((x) => x.id === assignedToUserId);
  const t = useTranslations();
  const format = useFormatter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RxPlus className="mr-2 size-4" />
          {t("Create task")}
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            className="my-2 border-none"
            type="text"
            placeholder="Event title..."
            onChange={(e) => setTitle(e.target.value)}
          ></Input>
          <Textarea
            className="my-2 border-none"
            placeholder="Add description..."
            onChange={(e) => setDescription(e.target.value)}
          ></Textarea>
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
              users={team?.Users ?? []}
            >
              <Button variant="outline" size="sm">
                <span className="sr-only">Open assign user popover</span>

                {user ? (
                  <>
                    <AvatarWrapper
                      className="mr-2 size-4"
                      src={user.image ?? ""}
                      alt={user.name ?? "" + " avatar"}
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
                    ? format.dateTime(dueDate, {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                    : t("Pick a date")}
                  {dueDate && (
                    <span
                      onClick={() => {
                        setDueDate(undefined);
                      }}
                      className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
                    >
                      <RxCross2 className="size-4 " />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
            </DatePickerWithPresets>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit" size="sm" onClick={handleCreateTask}>
            {t("Create task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

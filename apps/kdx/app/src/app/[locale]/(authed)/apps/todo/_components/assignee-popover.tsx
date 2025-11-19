import { useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kodix/ui/command";
import { AvatarWrapper } from "@kodix/ui/common/avatar-wrapper";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { HiUserCircle } from "react-icons/hi";

export function AssigneePopover({
  assignedToUserId,
  setAssignedToUserId,
  users,
  children,
}: {
  assignedToUserId: string | null;
  setAssignedToUserId: (newUserId: string | null) => void;
  users: {
    name: string | null;
    id: string;
    image: string | null;
  }[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const user = users.find((x) => x.id === assignedToUserId);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {children ??
          (user ? (
            <div>
              <AvatarWrapper
                alt={user.name ? `${user.name} avatar` : ""}
                className="h-6 w-6"
                fallback={user.name}
                src={user.image ?? undefined}
              />
            </div>
          ) : (
            <div>
              <HiUserCircle className="h-6 w-6 text-foreground/70" />
            </div>
          ))}
      </PopoverTrigger>
      <PopoverContent align={"start"} className="w-300 p-0" side="bottom">
        <Command>
          <CommandInput placeholder="Assign to user..." />
          <CommandList
            onSelect={() => {
              setOpen(false);
            }}
          >
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setAssignedToUserId(null);
                  setOpen(false);
                }}
              >
                <HiUserCircle className="mr-2 size-4" />
                Unassigned
              </CommandItem>
              {users.map((u) => (
                <CommandItem
                  key={u.id}
                  onSelect={() => {
                    setAssignedToUserId(u.id);
                    setOpen(false);
                  }}
                  value={u.id}
                >
                  <AvatarWrapper
                    alt={u.image ?? " avatar"}
                    className="mr-2 size-4"
                    fallback={<HiUserCircle className="mr-2 size-4" />}
                    src={u.image ?? ""}
                  />
                  {u.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

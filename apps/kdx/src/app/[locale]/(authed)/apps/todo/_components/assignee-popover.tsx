import { useState } from "react";
import { HiUserCircle } from "react-icons/hi";

import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : user ? (
          <div>
            <AvatarWrapper
              className="h-6 w-6"
              alt={user.name ? `${user.name} avatar` : ""}
              src={user.image ?? undefined}
              fallback={user.name}
            />
          </div>
        ) : (
          <div>
            <HiUserCircle className="h-6 w-6 text-foreground/70" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
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
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    setAssignedToUserId(user.id);
                    setOpen(false);
                  }}
                  value={user.id}
                >
                  <AvatarWrapper
                    className="mr-2 size-4"
                    src={user.image ?? ""}
                    alt={user.image ?? "" + " avatar"}
                    fallback={<HiUserCircle className="mr-2 size-4" />}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// "use client";

// import * as React from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   Check,
//   ChevronsUpDown,
//   Loader2,
//   PlusCircle,
//   Settings,
// } from "lucide-react";

// import type { RouterOutputs } from "@kdx/api";
// import { getBaseUrl } from "@kdx/api/src/shared";
// import type { Session } from "@kdx/auth";
// import {
//   AvatarWrapper,
//   Button,
//   buttonVariants,
//   cn,
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
//   DialogTrigger,
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@kdx/ui";

// import { api } from "~/trpc/react";
// import { switchTeamAction } from "./actions";
// import { AddTeamDialog } from "./add-team-dialog";

// export function TeamSwitcher({
//   session,
//   teams,
//   avatar,
// }: {
//   session: Session;
//   teams: RouterOutputs["team"]["getAllForLoggedUser"];
//   avatar: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [loading, setLoading] = React.useState(false);
//   const utils = api.useUtils();
//   const [open, setOpen] = React.useState(false);
//   const [showNewTeamDialog, setShowNewTeamDialog] =
//     React.useState(false);
//   if (!teams) return null;
//   return (
//     <AddTeamDialog
//       open={showNewTeamDialog}
//       onOpenChange={setShowNewTeamDialog}
//       session={session}
//     >
//       <Popover open={open} onOpenChange={setOpen}>
//         <div className="center flex justify-center rounded-lg">
//           <Link
//             href={`/team`}
//             className={cn(
//               buttonVariants({ variant: "ghost", size: "sm" }),
//               "justify-start hover:bg-inherit",
//             )}
//           >
//             <>
//               {avatar}
//               {session.user.activeTeamName.length > 19 ? (
//                 <span className="text-xs">
//                   {session.user.activeTeamName}
//                 </span>
//               ) : (
//                 session.user.activeTeamName
//               )}
//             </>
//           </Link>
//           <PopoverTrigger asChild>
//             <Button
//               variant="ghost"
//               size="sm"
//               disabled={loading}
//               role="combobox"
//               aria-expanded={open}
//               aria-label="Select a team"
//               className="w-8"
//             >
//               {loading ? (
//                 <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
//               ) : (
//                 <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
//               )}
//             </Button>
//           </PopoverTrigger>
//         </div>
//         <PopoverContent className="w-[200px] p-0">
//           <Command>
//             <CommandList>
//               <CommandInput placeholder="Search team..." />
//               <CommandEmpty>No team found.</CommandEmpty>
//               <CommandGroup>
//                 {teams.map((ws) => (
//                   <CommandItem
//                     key={ws.name}
//                     value={ws.name + ws.id}
//                     onSelect={async () => {
//                       setOpen(false);
//                       setLoading(true);
//                       await switchTeamAction({
//                         teamId: ws.id,
//                         redirect: pathname!,
//                       });
//                       void utils.invalidate(); //Invalidates the full router
//                       setLoading(false);
//                       router.refresh();
//                     }}
//                     className="text-sm"
//                   >
//                     <AvatarWrapper
//                       className="mr-2 h-5 w-5"
//                       src={`${getBaseUrl()}/api/avatar/${ws.name}`}
//                       alt={ws.name}
//                     />
//                     {ws.name}
//                     <Check
//                       className={cn(
//                         "ml-auto h-4 w-4",
//                         session.user.activeTeamId === ws.id
//                           ? "opacity-100"
//                           : "opacity-0",
//                       )}
//                     />
//                   </CommandItem>
//                 ))}
//               </CommandGroup>
//             </CommandList>
//             <CommandSeparator />
//             <CommandList>
//               <CommandGroup>
//                 <DialogTrigger asChild>
//                   <CommandItem
//                     onSelect={() => {
//                       setOpen(false);
//                       setShowNewTeamDialog(true);
//                     }}
//                   >
//                     <PlusCircle className="mr-2 h-5 w-5" />
//                     Create New Team
//                   </CommandItem>
//                 </DialogTrigger>
//                 <CommandItem
//                   onSelect={() => {
//                     router.push("/team/settings");
//                     setOpen(false);
//                   }}
//                 >
//                   <Settings className="mr-2 h-5 w-5" />
//                   Team Settings
//                 </CommandItem>
//               </CommandGroup>
//             </CommandList>
//           </Command>
//         </PopoverContent>
//       </Popover>
//     </AddTeamDialog>
//   );
// }

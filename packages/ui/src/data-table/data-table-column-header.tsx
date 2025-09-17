import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "..";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  children,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations();

  if (!(column.getCanSort() || column.getCanHide())) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              column.getIsSorted() === "desc"
                ? t("Sorted descending Click to sort ascending")
                : // biome-ignore lint/style/noNestedTernary: <biome migration>
                  column.getIsSorted() === "asc"
                  ? t("Sorted ascending Click to sort descending")
                  : t("Not sorted Click to sort ascending")
            }
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            size="sm"
            variant="ghost"
          >
            <div className="flex flex-row">{children}</div>
            {column.getCanSort() && column.getIsSorted() === "desc" ? (
              <ChevronDown aria-hidden="true" className="ml-2 size-4" />
            ) : // biome-ignore lint/style/noNestedTernary: <biome migration>
            column.getIsSorted() === "asc" ? (
              <ChevronUp aria-hidden="true" className="ml-2 size-4" />
            ) : (
              <ChevronsUpDown aria-hidden="true" className="ml-2 size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                aria-label={t("Sort ascending")}
                onClick={() => column.toggleSorting(false)}
              >
                <ChevronUp
                  aria-hidden="true"
                  className="mr-2 size-3.5 text-muted-foreground/70"
                />
                {t("Asc")}
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label={t("Sort descending")}
                onClick={() => column.toggleSorting(true)}
              >
                <ChevronDown
                  aria-hidden="true"
                  className="mr-2 size-3.5 text-muted-foreground/70"
                />
                {t("Desc")}
              </DropdownMenuItem>
            </>
          )}
          {column.getCanSort() && column.getCanHide() && (
            <DropdownMenuSeparator />
          )}
          {column.getCanHide() && (
            <DropdownMenuItem
              aria-label={t("Hide column")}
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeOff
                aria-hidden="true"
                className="mr-2 size-3.5 text-muted-foreground/70"
              />
              {t("Hide")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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

  if (!column.getCanSort() && !column.getCanHide()) {
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
                : column.getIsSorted() === "asc"
                  ? t("Sorted ascending Click to sort descending")
                  : t("Not sorted Click to sort ascending")
            }
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
          >
            <div className="flex flex-row">{children}</div>
            {column.getCanSort() && column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 size-4" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="ml-2 size-4" aria-hidden="true" />
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
                  className="text-muted-foreground/70 mr-2 size-3.5"
                  aria-hidden="true"
                />
                {t("Asc")}
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label={t("Sort descending")}
                onClick={() => column.toggleSorting(true)}
              >
                <ChevronDown
                  className="text-muted-foreground/70 mr-2 size-3.5"
                  aria-hidden="true"
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
                className="text-muted-foreground/70 mr-2 size-3.5"
                aria-hidden="true"
              />
              {t("Hide")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import type { Column } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { cn } from "@kodix/ui/lib/utils";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronsUpDown,
  EyeOff,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
}

const SORT_DROPDOWN_CLASSES = cn(
  "relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground",
);

export function DataTableColumnHeader<TData, TValue>({
  column,
  children,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations();

  if (!(column.getCanSort() || column.getCanHide())) {
    return <div className={cn(className)}>{children}</div>;
  }

  const content = children;

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{content}</div>;
  }

  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={
            column.getIsSorted() === "desc"
              ? t("Sorted descending Click to sort ascending")
              : // biome-ignore lint/style/noNestedTernary: <biome migration>
                column.getIsSorted() === "asc"
                ? t("Sorted ascending Click to sort descending")
                : t("Not sorted Click to sort ascending")
          }
          className="-ml-1.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
        >
          {content}
          {column.getCanSort() &&
            (column.getIsSorted() === "desc" ? (
              <ArrowDownWideNarrow aria-hidden="true" />
            ) : // biome-ignore lint/style/noNestedTernary: Better to have it in this way
            column.getIsSorted() === "asc" ? (
              <ArrowUpNarrowWide aria-hidden="true" />
            ) : (
              <ChevronsUpDown aria-hidden="true" />
            ))}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28">
          <DropdownMenuCheckboxItem
            checked={column.getIsSorted() === "asc"}
            className={SORT_DROPDOWN_CLASSES}
            onClick={() => column.toggleSorting(false, true)}
          >
            <ArrowUpNarrowWide aria-hidden="true" />
            {t("Asc")}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={column.getIsSorted() === "desc"}
            className={SORT_DROPDOWN_CLASSES}
            onClick={() => column.toggleSorting(true, true)}
          >
            <ArrowDownWideNarrow aria-hidden="true" />
            {t("Desc")}
          </DropdownMenuCheckboxItem>
          {column.getIsSorted() && (
            <DropdownMenuItem onClick={column.clearSorting}>
              <X aria-hidden="true" className="text-muted-foreground" />
              {t("Reset")}
            </DropdownMenuItem>
          )}
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                aria-label={t("Hide column")}
                onClick={() => column.toggleVisibility(false)}
              >
                <EyeOff
                  aria-hidden="true"
                  className="mr-2 size-3.5 text-muted-foreground"
                />
                {t("Hide")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

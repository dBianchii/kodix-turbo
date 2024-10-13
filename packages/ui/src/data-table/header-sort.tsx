import type { Column } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";

import { Button } from "../button";

export function HeaderSort<TData>({
  column,
  children,
  ...buttonAttributes
}: {
  column: Column<TData>;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const className = "ml-2 size-4";
  const isSorted = column.getIsSorted();

  const Icon = useMemo(
    () =>
      isSorted ? (
        isSorted === "asc" ? (
          <CaretUpIcon className={className} />
        ) : (
          <CaretDownIcon className={className} />
        )
      ) : (
        <CaretSortIcon className={className} />
      ),
    [isSorted],
  );

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      {...buttonAttributes}
    >
      {children}
      {Icon}
    </Button>
  );
}

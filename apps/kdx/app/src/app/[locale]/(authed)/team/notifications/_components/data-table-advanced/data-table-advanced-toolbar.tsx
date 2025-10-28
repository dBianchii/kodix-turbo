"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import { DataTableViewOptions } from "@kodix/ui/data-table/data-table-view-options";
import { useTranslations } from "next-intl";
import { LuChevronsUpDown, LuPlus } from "react-icons/lu";

import type { DataTableFilterField, DataTableFilterOption } from "./types";
import { DataTableFilterCombobox } from "./data-table-filter-combobox";
import { DataTableFilterItem } from "./data-table-filter-item";
import { DataTableMultiFilter } from "./data-table-multi-filter";

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const options = useMemo<DataTableFilterOption<TData>[]>(
    () =>
      filterFields.map((field) => ({
        id: crypto.randomUUID(),
        label: field.label,
        options: field.options ?? [],
        value: field.value,
      })),
    [filterFields],
  );

  const initialSelectedOptions = useMemo(() => {
    return options
      .filter((option) => searchParams.has(option.value as string))
      .map((option) => {
        // biome-ignore lint/style/noNonNullAssertion: <biome migration>
        const value = searchParams.get(String(option.value))!;
        const [filterValue, filterOperator] =
          value.split("~").filter(Boolean) ?? [];

        return {
          ...option,
          filterOperator,
          filterValues: filterValue?.split(".") ?? [],
        };
      });
  }, [options, searchParams]);

  const [selectedOptions, setSelectedOptions] = useState<
    DataTableFilterOption<TData>[]
  >(initialSelectedOptions);
  const [openFilterBuilder, setOpenFilterBuilder] = useState(
    initialSelectedOptions.length > 0,
  );
  const [openCombobox, setOpenCombobox] = useState(false);

  function onFilterComboboxItemSelect() {
    setOpenFilterBuilder(true);
    setOpenCombobox(true);
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col space-y-2.5 overflow-auto p-1",
        className,
      )}
      {...props}
    >
      <div className="ml-auto flex items-center gap-2">
        {children}
        {(options.length > 0 && selectedOptions.length > 0) ||
        openFilterBuilder ? (
          <Button
            onClick={() => setOpenFilterBuilder(!openFilterBuilder)}
            size="sm"
            variant="outline"
          >
            <LuChevronsUpDown
              aria-hidden="true"
              className="mr-2 size-4 shrink-0"
            />
            {t("Filter")}
          </Button>
        ) : (
          <DataTableFilterCombobox
            onSelect={onFilterComboboxItemSelect}
            options={options.filter(
              (option) =>
                !selectedOptions.some(
                  (selectedOption) => selectedOption.value === option.value,
                ),
            )}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        )}
        <DataTableViewOptions table={table} />
      </div>
      <div
        className={cn(
          "flex items-center gap-2",
          !openFilterBuilder && "hidden",
        )}
      >
        {selectedOptions
          .filter((option) => !option.isMulti)
          .map((selectedOption) => (
            <DataTableFilterItem
              defaultOpen={openCombobox}
              key={String(selectedOption.value)}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              table={table}
            />
          ))}
        {selectedOptions.some((option) => option.isMulti) ? (
          <DataTableMultiFilter
            allOptions={options}
            defaultOpen={openCombobox}
            options={selectedOptions.filter((option) => option.isMulti)}
            setSelectedOptions={setSelectedOptions}
            table={table}
          />
        ) : null}
        {options.length > 0 && options.length > selectedOptions.length ? (
          <DataTableFilterCombobox
            onSelect={onFilterComboboxItemSelect}
            options={options}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          >
            <Button
              className="h-7 rounded-full"
              onClick={() => setOpenCombobox(true)}
              role="combobox"
              size="sm"
              variant="outline"
            >
              <LuPlus aria-hidden="true" className="mr-2 size-4 opacity-50" />
              {t("Add filter")}
            </Button>
          </DataTableFilterCombobox>
        ) : null}
      </div>
    </div>
  );
}

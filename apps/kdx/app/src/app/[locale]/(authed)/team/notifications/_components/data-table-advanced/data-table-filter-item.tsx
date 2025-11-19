import type { Table } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dataTableConfig } from "@kodix/shared/data-table-config";
import { Button } from "@kodix/ui/button";
import { useDebounce } from "@kodix/ui/hooks/use-debounce";
import { Input } from "@kodix/ui/input";
import { cn } from "@kodix/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kodix/ui/select";
import { useTranslations } from "next-intl";
import { LuTrash } from "react-icons/lu";

import { usePathname, useRouter } from "~/i18n/routing";

import type { DataTableFilterOption } from "./types";
import { DataTableAdvancedFacetedFilter } from "./data-table-advanced-faceted-filter";

interface DataTableFilterItemProps<TData> {
  table: Table<TData>;
  selectedOption: DataTableFilterOption<TData>;
  selectedOptions: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >;
  defaultOpen: boolean;
}

export function DataTableFilterItem<TData>({
  table,
  selectedOption,
  selectedOptions,
  setSelectedOptions,
  defaultOpen,
}: DataTableFilterItemProps<TData>) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const column = table.getColumn(
    selectedOption.value ? String(selectedOption.value) : "",
  );

  const selectedValues = new Set(
    selectedOptions.find((item) => item.value === column?.id)?.filterValues,
  );

  const filterValues = Array.from(selectedValues);
  const filterOperator = selectedOptions.find(
    (item) => item.value === column?.id,
  )?.filterOperator;

  const operators =
    selectedOption.options.length > 0
      ? dataTableConfig.selectableOperators
      : dataTableConfig.comparisonOperators;

  const [value, setValue] = useState(filterValues[0] ?? "");
  const debounceValue = useDebounce(value, 500);
  const [open, setOpen] = useState(defaultOpen);
  const [selectedOperator, setSelectedOperator] = useState(
    operators.find((c) => c.value === filterOperator) ?? operators[0],
  );

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, v] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(v));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams, value],
  );

  // Update query string
  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
  useEffect(() => {
    if (selectedOption.options.length > 0) {
      // key=value1.value2.value3~operator
      const newSearchParams = createQueryString({
        [String(selectedOption.value)]:
          filterValues.length > 0
            ? `${filterValues.join(".")}~${selectedOperator?.value}`
            : null,
      });
      router.push(`${pathname}?${newSearchParams}`);
    } else {
      // key=value~operator
      const newSearchParams = createQueryString({
        [String(selectedOption.value)]:
          debounceValue.length > 0
            ? `${debounceValue}~${selectedOperator?.value}`
            : null,
      });
      router.push(`${pathname}?${newSearchParams}`);
    }
  }, [selectedOption, debounceValue, selectedOperator]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-7 gap-0 truncate rounded-full",
            (selectedValues.size > 0 || value.length > 0) && "bg-muted/50",
          )}
          size="sm"
          variant="outline"
        >
          <span className="font-medium capitalize">{selectedOption.label}</span>
          {selectedOption.options.length > 0
            ? selectedValues.size > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {selectedValues.size > 2
                    ? `${selectedValues.size} selected`
                    : selectedOption.options
                        .filter((item) => selectedValues.has(item.value))
                        .map((item) => item.label)
                        .join(", ")}
                </span>
              )
            : value.length > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {value}
                </span>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 space-y-1.5 p-2">
        <div className="flex items-center space-x-1 pr-0.5 pl-1">
          <div className="flex flex-1 items-center space-x-1">
            <div className="text-muted-foreground text-xs capitalize">
              {selectedOption.label}
            </div>
            <Select
              onValueChange={(v) =>
                setSelectedOperator(operators.find((c) => c.value === v))
              }
              value={selectedOperator?.value}
            >
              <SelectTrigger className="h-auto w-fit truncate border-none px-2 py-0.5 text-xs hover:bg-muted/50">
                <SelectValue placeholder={selectedOperator?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {operators.map((item) => (
                    <SelectItem
                      className="py-1"
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label={t("Remove filter")}
            className="size-7 text-muted-foreground"
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.value !== selectedOption.value),
              );

              const newSearchParams = createQueryString({
                [String(selectedOption.value)]: null,
              });
              router.push(`${pathname}?${newSearchParams}`);
            }}
            size="icon"
            variant="ghost"
          >
            <LuTrash aria-hidden="true" className="size-4" />
          </Button>
        </div>
        {selectedOption.options.length > 0 ? (
          column && (
            <DataTableAdvancedFacetedFilter
              column={column}
              key={String(selectedOption.value)}
              options={selectedOption.options}
              selectedValues={selectedValues}
              setSelectedOptions={setSelectedOptions}
              title={selectedOption.label}
            />
          )
        ) : (
          <Input
            autoFocus
            className="h-8"
            onChange={(event) => setValue(event.target.value)}
            placeholder={t("Filter by")}
            value={value}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

import type { Dispatch, SetStateAction } from "react";
import type { DataTableConfig } from "@kodix/shared/data-table-config";
import type { Table } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dataTableConfig } from "@kodix/shared/data-table-config";
import { Button } from "@kodix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { useDebounce } from "@kodix/ui/hooks/use-debounce";
import { Input } from "@kodix/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kodix/ui/select";
import { Separator } from "@kodix/ui/separator";
import { useTranslations } from "next-intl";
import { LuAlignCenter, LuCopy, LuTrash } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import { usePathname, useRouter } from "~/i18n/routing";

import type { DataTableFilterOption } from "./types";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableMultiFilterProps<TData> {
  table: Table<TData>;
  allOptions: DataTableFilterOption<TData>[];
  options: DataTableFilterOption<TData>[];
  setSelectedOptions: Dispatch<SetStateAction<DataTableFilterOption<TData>[]>>;
  defaultOpen: boolean;
}

export function DataTableMultiFilter<TData>({
  table,
  allOptions,
  options,
  setSelectedOptions,
  defaultOpen,
}: DataTableMultiFilterProps<TData>) {
  const t = useTranslations();
  const [open, setOpen] = useState(defaultOpen);
  const [operator, setOperator] = useState(dataTableConfig.logicalOperators[0]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-7 truncate rounded-full"
          size="sm"
          variant="outline"
        >
          <LuAlignCenter aria-hidden="true" className="mr-2 size-3" />
          {options.length} {t("rule")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0 text-xs">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              allOptions={allOptions}
              i={i}
              key={option.id ?? i}
              operator={operator}
              option={option}
              options={options}
              setOperator={setOperator}
              setSelectedOptions={setSelectedOptions}
              table={table}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label={t("Delete filter")}
            className="w-full justify-start"
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => !item.isMulti),
              );
            }}
            size="sm"
            variant="ghost"
          >
            {t("Delete filter")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MultiFilterRowProps<TData> {
  i: number;
  table: Table<TData>;
  allOptions: DataTableFilterOption<TData>[];
  option: DataTableFilterOption<TData>;
  options: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >;
  operator?: DataTableConfig["logicalOperators"][number];
  setOperator: React.Dispatch<
    React.SetStateAction<
      DataTableConfig["logicalOperators"][number] | undefined
    >
  >;
}

export function MultiFilterRow<TData>({
  i,
  table,
  option,
  allOptions,
  options,
  setSelectedOptions,
  operator,
  setOperator,
}: MultiFilterRowProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const debounceValue = useDebounce(value, 500);

  const [selectedOption, setSelectedOption] = useState<
    DataTableFilterOption<TData> | undefined
  >(options[0]);

  const filterVarieties = selectedOption?.options.length
    ? ["is", "is not"]
    : ["contains", "does not contain", "is", "is not"];

  const [filterVariety, setFilterVariety] = useState(filterVarieties[0]);

  // Update filter variety
  useEffect(() => {
    if (selectedOption?.options.length) {
      setFilterVariety("is");
    }
  }, [selectedOption?.options.length]);

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams],
  );

  // Update query string
  useEffect(() => {
    if (debounceValue.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: `${debounceValue}${
            debounceValue.length > 0 ? `.${filterVariety}` : ""
          }`,
        })}`,
        {
          scroll: false,
        },
      );
    }

    if (debounceValue.length === 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: null,
        })}`,
        {
          scroll: false,
        },
      );
    }
  }, [debounceValue, filterVariety, selectedOption?.value]);

  // Update operator query string
  useEffect(() => {
    if (operator?.value) {
      router.push(
        `${pathname}?${createQueryString({
          operator: operator.value,
        })}`,
        {
          scroll: false,
        },
      );
    }
  }, [operator?.value]);

  const t = useTranslations();

  return (
    <div className="flex items-center space-x-2">
      {i === 0 ? (
        <div>Where</div>
      ) : i === 1 ? (
        <Select
          onValueChange={(value) =>
            setOperator(
              dataTableConfig.logicalOperators.find((o) => o.value === value),
            )
          }
          value={operator?.value}
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTableConfig.logicalOperators.map((operator) => (
                <SelectItem
                  className="text-xs"
                  key={operator.value}
                  value={operator.value}
                >
                  {operator.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <div key={operator?.value}>{operator?.label}</div>
      )}
      <Select
        onValueChange={(value) => {
          setSelectedOption(
            allOptions.find((option) => option.value === value),
          );
          setSelectedOptions((prev) =>
            prev.map((item) => {
              if (item.id === option.id) {
                return {
                  ...item,
                  value: value as keyof TData,
                };
              }
              return item;
            }),
          );
        }}
        value={String(selectedOption?.value)}
      >
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map((option) => (
              <SelectItem
                className="text-xs capitalize"
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => setFilterVariety(value)}
        value={filterVariety}
      >
        <SelectTrigger className="h-8 w-full truncate px-2 py-0.5 hover:bg-muted/50">
          <SelectValue placeholder={filterVarieties[0]} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filterVarieties.map((variety) => (
              <SelectItem key={variety} value={variety}>
                {variety}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedOption?.options.length ? (
        table.getColumn(selectedOption.value ? String(option.value) : "") && (
          <DataTableFacetedFilter
            column={table.getColumn(
              selectedOption.value ? String(selectedOption.value) : "",
            )}
            key={selectedOption.id}
            options={selectedOption.options}
            title={selectedOption.label}
          />
        )
      ) : (
        <Input
          autoFocus
          className="h-8"
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("Type here")}
          value={value}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-8 shrink-0" size="icon" variant="ghost">
            <RxDotsHorizontal aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.id !== option.id),
              );
            }}
          >
            <LuTrash aria-hidden="true" className="mr-2 size-4" />
            {t("Remove")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!selectedOption) return;

              setSelectedOptions((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  label: selectedOption.label,
                  value: selectedOption.value,

                  options: selectedOption.options ?? [],
                  isMulti: true,
                },
              ]);
            }}
          >
            <LuCopy aria-hidden="true" className="mr-2 size-4" />
            {t("Duplicate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

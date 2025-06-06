// eslint-disable-next-line react-compiler/react-compiler
/* eslint-disable react-hooks/exhaustive-deps */
import type { Table } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LuAlignCenter, LuCopy, LuTrash } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { DataTableConfig } from "@kdx/shared";
import { dataTableConfig } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { useDebounce } from "@kdx/ui/hooks/use-debounce";
import { Input } from "@kdx/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import { Separator } from "@kdx/ui/separator";

import type { DataTableFilterOption } from "./types";
import { usePathname, useRouter } from "~/i18n/routing";
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 truncate rounded-full"
        >
          <LuAlignCenter className="mr-2 size-3" aria-hidden="true" />
          {options.length} {t("rule")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 text-xs" align="start">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              key={option.id ?? i}
              i={i}
              option={option}
              table={table}
              allOptions={allOptions}
              options={options}
              setSelectedOptions={setSelectedOptions}
              operator={operator}
              setOperator={setOperator}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label={t("Delete filter")}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => !item.isMulti),
              );
            }}
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
          value={operator?.value}
          onValueChange={(value) =>
            setOperator(
              dataTableConfig.logicalOperators.find((o) => o.value === value),
            )
          }
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTableConfig.logicalOperators.map((operator) => (
                <SelectItem
                  key={operator.value}
                  value={operator.value}
                  className="text-xs"
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
        value={String(selectedOption?.value)}
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
      >
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                className="text-xs capitalize"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={filterVariety}
        onValueChange={(value) => setFilterVariety(value)}
      >
        <SelectTrigger className="hover:bg-muted/50 h-8 w-full truncate px-2 py-0.5">
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
            key={selectedOption.id}
            column={table.getColumn(
              selectedOption.value ? String(selectedOption.value) : "",
            )}
            title={selectedOption.label}
            options={selectedOption.options}
          />
        )
      ) : (
        <Input
          placeholder={t("Type here")}
          className="h-8"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <RxDotsHorizontal className="size-4" aria-hidden="true" />
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
            <LuTrash className="mr-2 size-4" aria-hidden="true" />
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
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  options: selectedOption.options ?? [],
                  isMulti: true,
                },
              ]);
            }}
          >
            <LuCopy className="mr-2 size-4" aria-hidden="true" />
            {t("Duplicate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@kodix/ui/hooks/use-debounce";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import z from "zod";

import { usePathname, useRouter } from "~/i18n/routing";

import type { DataTableFilterField } from "../_components/data-table-advanced/types";

interface UseDataTableProps<TData, TValue> {
  /**
   * The data for the table.
   * @default []
   * @type TData[]
   */
  data: TData[];

  /**
   * The columns of the table.
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The number of pages in the table.
   * @type number
   */
  pageCount: number;

  /**
   * The default number of rows per page.
   * @default 10
   * @type number | undefined
   * @example 20
   */
  defaultPerPage?: number;

  /**
   * The default sort order.
   * @default undefined
   * @type `${Extract<keyof TData, string | number>}.${"asc" | "desc"}` | undefined
   * @example "createdAt.desc"
   */
  defaultSort?: `${Extract<keyof TData, string | number>}.${"asc" | "desc"}`;

  /**
   * Defines filter fields for the table. Supports both dynamic faceted filters and search filters.
   * - Faceted filters are rendered when `options` are provided for a filter field.
   * - Otherwise, search filters are rendered.
   *
   * The indie filter field `value` represents the corresponding column name in the database table.
   * @default []
   * @type { label: string, value: keyof TData, placeholder?: string, options?: { label: string, value: string, icon?: ComponentType<{ className?: string }> }[] }[]
   * @example
   * ```ts
   * // Render a search filter
   * const filterFields = [
   *   { label: "Title", value: "title", placeholder: "Search titles" }
   * ];
   * // Render a faceted filter
   * const filterFields = [
   *   {
   *     label: "Status",
   *     value: "status",
   *     options: [
   *       { label: "Todo", value: "todo" },
   *       { label: "In Progress", value: "in-progress" },
   *       { label: "Done", value: "done" },
   *       { label: "Canceled", value: "canceled" }
   *     ]
   *   }
   * ];
   * ```
   */
  filterFields?: DataTableFilterField<TData>[];

  /**
   * Enable notion like column filters.
   * Advanced filters and column filters cannot be used at the same time.
   * @default false
   * @type boolean
   */
  enableAdvancedFilter?: boolean;
}

const schema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().optional(),
  sort: z.string().optional(),
});

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  defaultPerPage = 10,
  defaultSort,
  filterFields = [],
  enableAdvancedFilter = false,
}: UseDataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search params
  const search = schema.parse(Object.fromEntries(searchParams));
  const page = search.page;
  const perPage = search.perPage ?? defaultPerPage;
  const sort = search.sort ?? defaultSort;
  const [column, order] = sort?.split(".") ?? [];

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = useMemo(
    () => ({
      filterableColumns: filterFields.filter((field) => field.options),
      searchableColumns: filterFields.filter((field) => !field.options),
    }),
    [filterFields],
  );

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

  // Initial column filters
  const initialColumnFilters: ColumnFiltersState = useMemo(
    () =>
      Array.from(searchParams.entries()).reduce<ColumnFiltersState>(
        (filters, [key, value]) => {
          const filterableColumn = filterableColumns.find(
            (c) => c.value === key,
          );
          const searchableColumn = searchableColumns.find(
            (c) => c.value === key,
          );

          if (filterableColumn) {
            filters.push({
              id: key,
              value: value.split("."),
            });
          } else if (searchableColumn) {
            filters.push({
              id: key,
              value: [value],
            });
          }

          return filters;
        },
        [],
      ),
    [filterableColumns, searchableColumns, searchParams],
  );

  // Table states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);

  // Handle server-side pagination

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: perPage,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        perPage: pageSize,
      })}`,
      {
        scroll: false,
      },
    );
  }, [pageIndex, pageSize]);

  // Handle server-side sorting
  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: order === "desc",
      id: column ?? "",
    },
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page,
        sort: sorting[0]?.id
          ? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}`
          : null,
      })}`,
    );
  }, [sorting]);

  // Handle server-side filtering
  const debouncedSearchableColumnFilters = JSON.parse(
    useDebounce(
      JSON.stringify(
        columnFilters.filter((filter) =>
          searchableColumns.find((c) => c.value === filter.id),
        ),
      ),
      500,
    ),
  ) as ColumnFiltersState;

  const filterableColumnFilters = columnFilters.filter((filter) =>
    filterableColumns.find((c) => c.value === filter.id),
  );

  const [mounted, setMounted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Fix me
  useEffect(() => {
    // Opt out when advanced filter is enabled, because it contains additional params
    if (enableAdvancedFilter) return;

    // Prevent resetting the page on initial render
    if (!mounted) {
      setMounted(true);
      return;
    }

    // Initialize new params
    const newParamsObject = {
      page: 1,
    };

    // Handle debounced searchable column filters
    for (const columnFilterValue of debouncedSearchableColumnFilters) {
      if (typeof columnFilterValue.value === "string") {
        Object.assign(newParamsObject, {
          [columnFilterValue.id]:
            typeof columnFilterValue.value === "string"
              ? columnFilterValue.value
              : null,
        });
      }
    }

    // Handle filterable column filters
    for (const columnFilterValue of filterableColumnFilters) {
      if (
        typeof columnFilterValue.value === "object" &&
        Array.isArray(columnFilterValue.value)
      ) {
        Object.assign(newParamsObject, {
          [columnFilterValue.id]: columnFilterValue.value.join("."),
        });
      }
    }

    // Remove deleted values
    for (const key of searchParams.keys()) {
      if (
        (searchableColumns.find((c) => c.value === key) &&
          !debouncedSearchableColumnFilters.find((c) => c.id === key)) ||
        (filterableColumns.find((c) => c.value === key) &&
          !filterableColumnFilters.find((c) => c.id === key))
      ) {
        Object.assign(newParamsObject, { [key]: null });
      }
    }

    // After cumulating all the changes, push new params
    router.push(`${pathname}?${createQueryString(newParamsObject)}`);

    table.setPageIndex(0);
  }, [
    JSON.stringify(debouncedSearchableColumnFilters),

    JSON.stringify(filterableColumnFilters),
  ]);

  const table = useReactTable({
    columns,
    data,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,

    pageCount: pageCount ?? -1,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting,
    },
  });

  return { table };
}

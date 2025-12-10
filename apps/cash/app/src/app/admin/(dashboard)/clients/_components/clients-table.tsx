"use client";

import type { RouterOutputs } from "@cash/api";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
import { Button } from "@kodix/ui/button";
import { DataTableColumnHeader } from "@kodix/ui/common/data-table/data-table-column-header";
import { DataTablePagination } from "@kodix/ui/common/data-table/data-table-pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@kodix/ui/input-group";
import { Label } from "@kodix/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  Search,
  User,
  UserX,
  Wallet,
  X,
} from "lucide-react";

import { useClientsSearchParams } from "./clients-url-state";

const CPF_FORMAT_REGEX = /(\d{3})(\d{3})(\d{3})(\d{2})/;

const columnHelper =
  createColumnHelper<
    RouterOutputs["admin"]["client"]["list"]["data"][number]
  >();

export function ClientsTable() {
  const [params, setParams] = useClientsSearchParams();
  const { globalSearch = "", page = 1, perPage = 50 } = params;

  const router = useRouter();
  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.admin.client.list.queryOptions({
      globalSearch,
      page,
      perPage,
      sort: params.sort,
    }),
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium">{info.getValue()}</span>
            {info.row.original.email && (
              <span className="text-muted-foreground text-sm">
                {info.row.original.email}
              </span>
            )}
          </div>
        ),
        header: ({ column }) => (
          <DataTableColumnHeader className="ml-2" column={column}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Cliente</span>
            </div>
          </DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("document", {
        cell: (info) => {
          const formatted = info
            .getValue()
            .replace(CPF_FORMAT_REGEX, "$1.$2.$3-$4");
          return <span className="font-mono text-sm">{formatted}</span>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>CPF</span>
            </div>
          </DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("totalAvailableCashback", {
        cell: (info) => (
          <div className="text-left font-medium">
            {formatCurrency("BRL", info.getValue())}
          </div>
        ),
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Cashback</span>
            </div>
          </DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("registeredFromFormAt", {
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return (
              <div className="text-center text-muted-foreground text-sm">-</div>
            );
          }

          return <div className="text-center text-sm">{formatDate(value)}</div>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader className="justify-center" column={column}>
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Cadastro</span>
            </div>
          </DataTableColumnHeader>
        ),
      }),
    ],
    [],
  );

  const pagination = {
    pageIndex: page - 1,
    pageSize: perPage,
  };

  const table = useReactTable({
    columns,
    data: data?.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setParams({
        page: newPagination.pageIndex + 1,
        perPage: newPagination.pageSize,
      });
    },
    pageCount: data?.pageCount ?? 0,
    state: {
      pagination,
    },
  });

  const isFiltered = globalSearch;

  const handleResetFilters = () => {
    setParams({
      globalSearch: null,
      page: 1,
      perPage: 50,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1 space-y-2">
          <Label htmlFor="globalSearch">Buscar</Label>
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <InputGroupText>
                <Search />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="globalSearch"
              onChange={(e) => {
                setParams({
                  globalSearch: e.target.value || null,
                  page: 1,
                });
              }}
              placeholder="Buscar..."
              value={globalSearch}
            />
          </InputGroup>
        </div>
        {isFiltered && (
          <Button className="h-10" onClick={handleResetFilters} variant="ghost">
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Table containerClassName="border rounded-md">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {(() => {
            if (isPending) {
              return (
                <TableRow>
                  <TableCell
                    className="h-96 text-center"
                    colSpan={columns.length}
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            if (error) {
              return (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-muted-foreground text-sm">
                        Erro ao carregar clientes: {error.message}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            if (table.getRowModel().rows.length) {
              return table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                  onClick={() => {
                    router.push(`/admin/clients/${row.original.id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ));
            }

            return (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="h-5 w-5 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Nenhum cliente encontrado
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            );
          })()}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}

"use client";

import type { RouterOutputs } from "@cash/api";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Button } from "@kodix/ui/button";
import { DataTableColumnHeader } from "@kodix/ui/common/data-table/data-table-column-header";
import { DataTablePagination } from "@kodix/ui/common/data-table/data-table-pagination";
import { Input } from "@kodix/ui/input";
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
  Loader2,
  Search,
  User,
  UserX,
  Wallet,
  X,
} from "lucide-react";

import { useClientsSearchParams } from "./clients-url-state";

const columnHelper =
  createColumnHelper<
    RouterOutputs["admin"]["client"]["list"]["data"][number]
  >();

export function ClientsTable() {
  const [params, setParams] = useClientsSearchParams();
  const { clientName = "", page = 1, perPage = 50 } = params;

  const router = useRouter();
  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.admin.client.list.queryOptions({
      clientName,
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
      columnHelper.accessor("cashback", {
        cell: (info) => {
          const amount = info.getValue();
          const formatted = new Intl.NumberFormat("pt-BR", {
            currency: "BRL",
            style: "currency",
          }).format(amount);

          return <div className="text-left font-medium">{formatted}</div>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Cashback</span>
            </div>
          </DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("createdAt", {
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return (
              <div className="text-center text-muted-foreground text-sm">-</div>
            );
          }

          const date = new Date(value);
          const formatted = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date);

          return <div className="text-center text-sm">{formatted}</div>;
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

  const isFiltered = clientName;

  const handleResetFilters = () => {
    setParams({
      clientName: null,
      page: 1,
      perPage: 50,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1 space-y-2">
          <Label htmlFor="clientName">Nome do Cliente</Label>
          <div className="relative max-w-xs">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              id="clientName"
              onChange={(e) => {
                setParams({
                  clientName: e.target.value || null,
                  page: 1,
                });
              }}
              placeholder="Buscar por nome do cliente..."
              value={clientName}
            />
          </div>
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

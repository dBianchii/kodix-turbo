"use client";

import { useMemo, useState } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Badge } from "@kodix/ui/badge";
import { Button } from "@kodix/ui/button";
import { DatePicker } from "@kodix/ui/common/date-picker";
import { DataTableColumnHeader } from "@kodix/ui/data-table/data-table-column-header";
import { DataTablePagination } from "@kodix/ui/data-table/data-table-pagination";
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
import { Loader2, X } from "lucide-react";

interface Sale {
  id: string;
  caId: string;
  caNumero: string;
  total: number;
  caCreatedAt: Date;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientType: "Estrangeira" | "Física" | "Jurídica";
}

const columnHelper = createColumnHelper<Sale>();

export function SalesTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [clientName, setClientName] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const trpc = useTRPC();

  const { data, isPending, error } = useQuery(
    trpc.sales.list.queryOptions({
      clientName: clientName || undefined,
      dateFrom: dateFrom?.toISOString() || undefined,
      dateTo: dateTo?.toISOString() || undefined,
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
    })
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("caNumero", {
        cell: (info) => (
          <div className="font-mono text-sm">{info.getValue()}</div>
        ),
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>Número</DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("clientName", {
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium">{info.getValue()}</span>
            {info.row.original.clientEmail && (
              <span className="text-muted-foreground text-sm">
                {info.row.original.clientEmail}
              </span>
            )}
          </div>
        ),
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>Cliente</DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("clientType", {
        cell: (info) => {
          const type = info.getValue();

          let variant: "default" | "secondary" | "outline";
          if (type === "Jurídica") {
            variant = "default";
          } else if (type === "Física") {
            variant = "secondary";
          } else {
            variant = "outline";
          }

          return <Badge variant={variant}>{type}</Badge>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            Tipo Cliente
          </DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("total", {
        cell: (info) => {
          const amount = info.getValue();
          const formatted = new Intl.NumberFormat("pt-BR", {
            currency: "BRL",
            style: "currency",
          }).format(amount);

          return <div className="text-right font-medium">{formatted}</div>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>Total</DataTableColumnHeader>
        ),
      }),
      columnHelper.accessor("caCreatedAt", {
        cell: (info) => {
          const date = new Date(info.getValue());
          const formatted = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date);

          return <div className="text-sm">{formatted}</div>;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>Data</DataTableColumnHeader>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: data?.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    pageCount: data?.pageCount ?? 0,
    state: {
      pagination,
    },
  });

  const isFiltered = clientName || dateFrom || dateTo;

  const handleResetFilters = () => {
    setClientName("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPagination({ pageIndex: 0, pageSize: 50 });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="clientName">Nome do Cliente</Label>
          <Input
            className="max-w-xs"
            id="clientName"
            onChange={(e) => {
              setClientName(e.target.value);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
            placeholder="Buscar por nome do cliente..."
            value={clientName}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Inicial</Label>
          <DatePicker
            className="w-full"
            date={dateFrom}
            setDate={(newDate) => {
              setDateFrom(newDate);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Final</Label>
          <DatePicker
            className="w-full"
            date={dateTo}
            setDate={(newDate) => {
              setDateTo(newDate);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
          />
        </div>
        {isFiltered && (
          <Button className="h-10" onClick={handleResetFilters} variant="ghost">
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                      <p className="text-muted-foreground text-sm">
                        Erro ao carregar vendas: {error.message}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              }

              if (table.getRowModel().rows.length) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

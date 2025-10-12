"use client";

import { useState } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";
import { Input } from "@kodix/ui/input";
import { Label } from "@kodix/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kodix/ui/select";
import { useQuery } from "@tanstack/react-query";

function getPendenteValue(pendente: string): boolean | undefined {
  if (pendente === "true") return true;
  if (pendente === "false") return false;
}

export function VendasViewer() {
  const trpc = useTRPC();

  const [pagina, setPagina] = useState("1");
  const [tamanhoPagina, setTamanhoPagina] = useState("10");
  const [campoOrdenado, setCampoOrdenado] = useState<
    "asc" | "desc" | undefined
  >();
  const [tipoOrdenacao, setTipoOrdenacao] = useState<
    "NUMERO" | "CLIENTE" | "DATA"
  >("DATA");
  const [termoBusca, setTermoBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dataCriacaoDe, setDataCriacaoDe] = useState("");
  const [dataCriacaoAte, setDataCriacaoAte] = useState("");
  const [pendente, setPendente] = useState<string>("all");
  const [totais, setTotais] = useState<string>("ALL");

  const { data, error, isLoading, refetch } = useQuery(
    trpc.ca.sales.list.queryOptions(
      {
        campoOrdenadoAscendente:
          campoOrdenado === "asc" ? tipoOrdenacao : undefined,
        campoOrdenadoDescendente:
          campoOrdenado === "desc" ? tipoOrdenacao : undefined,
        data_fim: dataFim || undefined,
        data_inicio: dataInicio || undefined,
        dataCriacaoAte: dataCriacaoAte || undefined,
        dataCriacaoDe: dataCriacaoDe || undefined,
        pagina: pagina ? Number.parseInt(pagina, 10) : 1,
        pendente: getPendenteValue(pendente),
        tamanho_pagina: tamanhoPagina ? Number.parseInt(tamanhoPagina, 10) : 10,
        termoBusca: termoBusca || undefined,
        totais: totais === "ALL" ? undefined : totais,
      },
      {
        enabled: false,
      }
    )
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conta Azul - Busca de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pagina">Página</Label>
              <Input
                id="pagina"
                min="1"
                onChange={(e) => setPagina(e.target.value)}
                type="number"
                value={pagina}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamanhoPagina">Tamanho Página</Label>
              <Input
                id="tamanhoPagina"
                max="100"
                min="1"
                onChange={(e) => setTamanhoPagina(e.target.value)}
                type="number"
                value={tamanhoPagina}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termoBusca">Termo de Busca</Label>
              <Input
                id="termoBusca"
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Nome, email ou número da venda"
                value={termoBusca}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoOrdenacao">Ordenar Por</Label>
              <Select
                onValueChange={(value: "NUMERO" | "CLIENTE" | "DATA") =>
                  setTipoOrdenacao(value)
                }
                value={tipoOrdenacao}
              >
                <SelectTrigger id="tipoOrdenacao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUMERO">Número</SelectItem>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                  <SelectItem value="DATA">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campoOrdenado">Ordem</Label>
              <Select
                onValueChange={(value) =>
                  setCampoOrdenado(value as "asc" | "desc" | undefined)
                }
                value={campoOrdenado}
              >
                <SelectTrigger id="campoOrdenado">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente</SelectItem>
                  <SelectItem value="desc">Descendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pendente">Pendente</Label>
              <Select onValueChange={setPendente} value={pendente}>
                <SelectTrigger id="pendente">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início (Emissão)</Label>
              <Input
                id="dataInicio"
                onChange={(e) => setDataInicio(e.target.value)}
                type="date"
                value={dataInicio}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim (Emissão)</Label>
              <Input
                id="dataFim"
                onChange={(e) => setDataFim(e.target.value)}
                type="date"
                value={dataFim}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataCriacaoDe">Data Criação De</Label>
              <Input
                id="dataCriacaoDe"
                onChange={(e) => setDataCriacaoDe(e.target.value)}
                type="date"
                value={dataCriacaoDe}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataCriacaoAte">Data Criação Até</Label>
              <Input
                id="dataCriacaoAte"
                onChange={(e) => setDataCriacaoAte(e.target.value)}
                type="date"
                value={dataCriacaoAte}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totais">Tipo de Total</Label>
              <Select onValueChange={setTotais} value={totais}>
                <SelectTrigger id="totais">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="WAITING_APPROVED">
                    Esperando Aprovação
                  </SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            disabled={isLoading}
            onClick={() => {
              refetch();
            }}
            type="button"
          >
            {isLoading ? "Carregando..." : "Buscar Vendas"}
          </Button>

          {error && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-900">
              <strong>Erro:</strong> {error.message}
            </div>
          )}

          {data ? (
            <div className="rounded-lg border bg-slate-50 p-4">
              <pre className="overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

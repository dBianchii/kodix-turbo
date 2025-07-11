"use client";

import { useState } from "react";
import { Building, Cpu, Key, Plus } from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@kdx/ui/sheet";

import { useAiProviderList } from "~/hooks/useAiProvider";
import { AiProviderCard } from "./components/AiProviderCard";
import { AiProviderForm } from "./components/AiProviderForm";
import { AiProviderTokenForm } from "./components/AiProviderTokenForm";

export default function AiProvidersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [tokenProviderId, setTokenProviderId] = useState<string | null>(null);
  const [tokenProviderName, setTokenProviderName] = useState<string>("");

  const { providers, isLoading } = useAiProviderList();

  const handleNovo = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditar = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleVisualizar = (id: string) => {
    setViewingId(id);
  };

  const handleGerenciarToken = (id: string) => {
    const provider =
      providers && providers.length > 0
        ? providers.find((p: any) => p?.id === id)
        : null;
    setTokenProviderId(id);
    setTokenProviderName((provider as any)?.name || "Provider");
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleTokenSuccess = () => {
    setTokenProviderId(null);
    setTokenProviderName("");
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Building className="h-8 w-8" />
            AI Providers
          </h1>
          <p className="text-muted-foreground">
            Gerencie provedores de IA, tokens e configurações de acesso
          </p>
        </div>
        <Button onClick={handleNovo} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Provider
        </Button>
      </div>

      {/* Cards informativos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Providers
            </CardTitle>
            <Building className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length || 0}</div>
            <p className="text-muted-foreground text-xs">
              Provedores configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Tokens</CardTitle>
            <Key className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Tokens configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Modelos Ativos
            </CardTitle>
            <Cpu className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Modelos disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Providers */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="bg-muted h-6 w-3/4 rounded"></div>
                <div className="bg-muted h-4 w-1/2 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-full rounded"></div>
                  <div className="bg-muted h-4 w-2/3 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !providers || providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="max-w-md text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Building className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Nenhum provider configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro provider de IA para usar modelos
                como GPT, Claude, Gemini e outros.
              </p>
              <Button onClick={handleNovo}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Provider
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider: any) => (
            <AiProviderCard
              key={provider?.id || Math.random()}
              provider={provider}
              onEditar={handleEditar}
              onVisualizar={handleVisualizar}
              onGerenciarToken={handleGerenciarToken}
            />
          ))}
        </div>
      )}

      {/* Formulário em Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Editar Provider" : "Novo Provider"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AiProviderForm
              providerId={editingId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de visualização */}
      <Dialog
        open={!!viewingId}
        onOpenChange={(open) => !open && setViewingId(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Provider</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {/* TODO: Implementar componente de visualização detalhada */}
            <p>Visualização detalhada do provider será implementada aqui</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de gerenciamento de token */}
      <Dialog
        open={!!tokenProviderId}
        onOpenChange={(open) => !open && setTokenProviderId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Token</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {tokenProviderId && (
              <AiProviderTokenForm
                providerId={tokenProviderId}
                providerName={tokenProviderName}
                onSuccess={handleTokenSuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

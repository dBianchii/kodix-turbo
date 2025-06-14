"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Globe,
  Key,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

import type { AiProvider } from "~/hooks/useAiProvider";
import { useAiProviderForm } from "~/hooks/useAiProvider";
import { useProviderHasToken } from "~/hooks/useAiProviderToken";

interface AiProviderCardProps {
  provider: AiProvider;
  onEditar?: (id: string) => void;
  onVisualizar?: (id: string) => void;
  onGerenciarToken?: (id: string) => void;
}

export function AiProviderCard({
  provider,
  onEditar,
  onVisualizar,
  onGerenciarToken,
}: AiProviderCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deletar, isDeleting } = useAiProviderForm();
  const { hasToken } = useProviderHasToken(provider.id);

  const handleDelete = () => {
    deletar(provider);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 truncate text-lg">
                {provider.name}
                {hasToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={hasToken ? "default" : "secondary"}>
                  {hasToken ? "Configurado" : "Sem Token"}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(provider.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onVisualizar?.(provider.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditar?.(provider.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onGerenciarToken?.(provider.id)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Gerenciar Token
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {provider.baseUrl && (
            <p className="text-muted-foreground mb-4 flex items-center gap-2 truncate text-sm">
              <Globe className="h-4 w-4 flex-shrink-0" />
              {provider.baseUrl}
            </p>
          )}

          {provider.models && provider.models.length > 0 && (
            <div className="mb-4">
              <p className="text-muted-foreground mb-2 text-xs">
                {provider.models.length} modelo(s) disponível(eis)
              </p>
              <div className="flex flex-wrap gap-1">
                {provider.models.slice(0, 3).map((model) => (
                  <Badge key={model.id} variant="outline" className="text-xs">
                    {model.name}
                  </Badge>
                ))}
                {provider.models.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.models.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasToken ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Token configurado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <XCircle className="h-3 w-3" />
                  Token necessário
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGerenciarToken?.(provider.id)}
              >
                <Key className="mr-1 h-3 w-3" />
                Token
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVisualizar?.(provider.id)}
              >
                Ver detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o provider "{provider.name}"? Esta
              ação também removerá todos os modelos e tokens associados.
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir Provider"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

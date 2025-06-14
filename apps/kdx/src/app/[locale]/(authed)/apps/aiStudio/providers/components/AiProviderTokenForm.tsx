"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription } from "@kdx/ui/alert";
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
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

import type { AiProviderTokenFormData } from "~/hooks/useAiProviderToken";
import {
  useAiProviderTokenForm,
  useProviderHasToken,
} from "~/hooks/useAiProviderToken";

interface AiProviderTokenFormProps {
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
}

export function AiProviderTokenForm({
  providerId,
  providerName,
  onSuccess,
}: AiProviderTokenFormProps) {
  const [showToken, setShowToken] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    hasToken,
    token,
    isLoading: loadingToken,
  } = useProviderHasToken(providerId);

  const {
    form,
    handleSubmit,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    deletar,
  } = useAiProviderTokenForm((result) => {
    form.reset({ providerId, token: "" });
    onSuccess?.();
  });

  // Preencher formulário se já existe token
  useEffect(() => {
    if (token) {
      form.reset({
        providerId,
        token: token.token || "",
      });
    } else {
      form.reset({
        providerId,
        token: "",
      });
    }
  }, [token, providerId, form]);

  const onSubmit = (data: AiProviderTokenFormData) => {
    handleSubmit(data, token?.id);
  };

  const handleDelete = () => {
    deletar(providerId);
    setShowDeleteDialog(false);
  };

  const isLoading = isCreating || isUpdating || isDeleting;
  const error = createError || updateError || deleteError;

  if (loadingToken) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Carregando configurações de token...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token do Provider: {providerName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(error as any)?.message || "Erro ao gerenciar token"}
                  </AlertDescription>
                </Alert>
              )}

              {hasToken && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Token já configurado para este provider. Você pode
                    atualizá-lo abaixo.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Token de Acesso da API *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showToken ? "text" : "password"}
                          placeholder={
                            hasToken
                              ? "••••••••••••••••"
                              : "Cole seu token aqui..."
                          }
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Token de autenticação da API do provider.
                      {hasToken
                        ? " Deixe em branco para manter o token atual."
                        : ""}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                  <Shield className="h-4 w-4" />
                  🔒 Segurança
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    • O token será criptografado automaticamente antes de ser
                    salvo
                  </p>
                  <p>• Apenas você e sua equipe podem acessar este token</p>
                  <p>
                    • Recomendamos usar tokens com escopo limitado quando
                    possível
                  </p>
                  <p>• Nunca compartilhe tokens de API publicamente</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {hasToken
                    ? isLoading
                      ? "Atualizando..."
                      : "Atualizar Token"
                    : isLoading
                      ? "Salvando..."
                      : "Salvar Token"}
                </Button>

                {hasToken && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção do token</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o token do provider "{providerName}
              "?
              <br />
              <br />
              Isso impedirá que este provider seja usado até que um novo token
              seja configurado.
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
              {isDeleting ? "Removendo..." : "Remover Token"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

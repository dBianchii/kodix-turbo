"use client";

import { useEffect } from "react";
import { AlertCircle, Building, Globe, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@kdx/ui/alert";
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

import type { AiProviderFormData } from "~/hooks/useAiProvider";
import { useAiProviderForm, useAiProviderItem } from "~/hooks/useAiProvider";

interface AiProviderFormProps {
  providerId?: string;
  onSuccess?: (provider: any) => void;
  onCancel?: () => void;
}

export function AiProviderForm({
  providerId,
  onSuccess,
  onCancel,
}: AiProviderFormProps) {
  const isEditing = !!providerId;

  const {
    form,
    handleSubmit,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useAiProviderForm(onSuccess);

  // Buscar dados do provider se estiver editando
  const { provider, isLoading: loadingProvider } = useAiProviderItem(
    providerId || "",
  );

  // Preencher formulário quando carregar dados para edição
  useEffect(() => {
    if (provider?.name) {
      form.reset({
        name: provider.name,
        baseUrl: provider.baseUrl || "",
      });
    }
  }, [provider, form]);

  const onSubmit = (data: AiProviderFormData) => {
    handleSubmit(data, providerId);
  };

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  if (loadingProvider) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Carregando dados do provider...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {isEditing ? "Editar Provider" : "Novo Provider"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(error as any)?.message || "Erro ao salvar provider"}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Provider *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: OpenAI, Anthropic, Google, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome identificador do provider de IA (mínimo 2 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URL Base da API
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.openai.com/v1"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL base para as chamadas da API (opcional). Se não
                    informada, será usada a URL padrão do provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">
                💡 Próximos passos
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• Configure o token de acesso para este provider</p>
                <p>• Adicione modelos associados a este provider</p>
                <p>• Teste a conectividade antes de usar em produção</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? isLoading
                    ? "Atualizando..."
                    : "Atualizar Provider"
                  : isLoading
                    ? "Criando..."
                    : "Criar Provider"}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

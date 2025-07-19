"use client";

import { CheckCircle, Globe, Info, Key, XCircle } from "lucide-react";

import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@kdx/ui/tooltip";

interface AiProvider {
  providerId: string;
  name: string;
  baseUrl: string;
}

interface AiProviderCardProps {
  provider: AiProvider;
  hasToken?: boolean;
  onManageToken?: (providerId: string) => void;
}

export function AiProviderCard({
  provider,
  hasToken = false,
  onManageToken,
}: AiProviderCardProps) {
  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 truncate text-lg">
              {provider.name}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Providers are managed via JSON configuration</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">Read-only</Badge>
              <Badge variant={hasToken ? "default" : "secondary"}>
                {hasToken ? "Token Configured" : "No Token"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {hasToken ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{provider.baseUrl}</span>
        </div>

        <div className="space-y-3">
          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Provider configuration is managed via JSON file and cannot be edited through the UI.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasToken ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Token configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <XCircle className="h-3 w-3" />
                  Token required
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onManageToken?.(provider.providerId)}
            >
              <Key className="mr-1 h-3 w-3" />
              Manage Token
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
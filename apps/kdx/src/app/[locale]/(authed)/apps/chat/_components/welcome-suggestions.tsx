"use client";

import {
  BookOpen,
  Code,
  FileText,
  Lightbulb,
  MessageSquare,
  Zap,
} from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";

interface WelcomeSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function WelcomeSuggestions({
  onSuggestionClick,
}: WelcomeSuggestionsProps) {
  const suggestions = [
    {
      icon: Code,
      title: "Ajuda com Código",
      description: "Explique um conceito técnico ou revise meu código",
      prompt:
        "Preciso de ajuda com programação. Pode me explicar um conceito ou revisar meu código?",
    },
    {
      icon: FileText,
      title: "Revisão de Texto",
      description: "Melhore a escrita e gramática do meu texto",
      prompt: "Pode revisar e melhorar este texto para mim?",
    },
    {
      icon: Lightbulb,
      title: "Brainstorm de Ideias",
      description: "Gere ideias criativas para meu projeto",
      prompt: "Vamos fazer um brainstorm de ideias criativas para meu projeto",
    },
    {
      icon: BookOpen,
      title: "Explicar Conceitos",
      description: "Explique tópicos complexos de forma simples",
      prompt: "Pode explicar um conceito complexo de forma simples e didática?",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-sm">
          Ou experimente uma dessas sugestões:
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;

          return (
            <Card
              key={index}
              className="hover:border-primary/20 cursor-pointer border-2 p-4 transition-all duration-200 hover:shadow-md"
              onClick={() => onSuggestionClick(suggestion.prompt)}
            >
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <IconComponent className="text-primary h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-medium">
                    {suggestion.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

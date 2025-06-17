"use client";

import {
  BookOpen,
  Code,
  FileText,
  Lightbulb,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";

interface WelcomeSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function WelcomeSuggestions({
  onSuggestionClick,
}: WelcomeSuggestionsProps) {
  const t = useTranslations();

  const suggestions = [
    {
      icon: Code,
      title: "Code Help",
      description: "Explain a technical concept or review my code",
      prompt:
        "I need help with programming. Can you explain a concept or review my code?",
    },
    {
      icon: FileText,
      title: "Text Review",
      description: "Improve the writing and grammar of my text",
      prompt: "Can you review and improve this text for me?",
    },
    {
      icon: Lightbulb,
      title: "Brainstorm Ideas",
      description: "Generate creative ideas for my project",
      prompt: "Let's brainstorm creative ideas for my project",
    },
    {
      icon: BookOpen,
      title: "Explain Concepts",
      description: "Explain complex topics in a simple way",
      prompt: "Can you explain a complex concept in a simple and didactic way?",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-sm">
          Or try one of these suggestions:
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

"use client";

import { AgentsSection } from "./sections/agents-section";
import { LibrariesSection } from "./sections/libraries-section";
import { ModelsSection } from "./sections/models-section";
import { TokensSection } from "./sections/tokens-section";

interface AiStudioContentProps {
  activeSection: string;
}

export function AiStudioContent({ activeSection }: AiStudioContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "agents":
        return <AgentsSection />;
      case "libraries":
        return <LibrariesSection />;
      case "models":
        return <ModelsSection />;
      case "tokens":
        return <TokensSection />;
      default:
        return <AgentsSection />;
    }
  };

  return <div className="h-full">{renderSection()}</div>;
}

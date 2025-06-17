"use client";

import { AgentsSection } from "./sections/agents-section";
import { EnabledModelsSection } from "./sections/enabled-models-section";
import { LibrariesSection } from "./sections/libraries-section";
import { ModelsSection } from "./sections/models-section";
import { ProvidersSection } from "./sections/providers-section";
import { TeamInstructionsSection } from "./sections/team-instructions-section";
import { TokensSection } from "./sections/tokens-section";

interface AiStudioContentProps {
  activeSection: string;
}

export function AiStudioContent({ activeSection }: AiStudioContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "team-instructions":
        return <TeamInstructionsSection />;
      case "agents":
        return <AgentsSection />;
      case "libraries":
        return <LibrariesSection />;
      case "models":
        return <ModelsSection />;
      case "providers":
        return <ProvidersSection />;
      case "tokens":
        return <TokensSection />;
      case "enabled-models":
        return <EnabledModelsSection />;
      default:
        return <TokensSection />;
    }
  };

  return <div className="h-full">{renderSection()}</div>;
}

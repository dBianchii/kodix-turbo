"use client";

import { lazy, Suspense } from "react";

// ✅ Lazy load sections to prevent unnecessary API calls
const TeamInstructionsSection = lazy(() => 
  import("./sections/team-instructions-section").then(m => ({ default: m.TeamInstructionsSection }))
);
const UserInstructionsSection = lazy(() => 
  import("./sections/user-instructions-section").then(m => ({ default: m.UserInstructionsSection }))
);
const AgentsSection = lazy(() => 
  import("./sections/agents-section").then(m => ({ default: m.AgentsSection }))
);
const LibrariesSection = lazy(() => 
  import("./sections/libraries-section").then(m => ({ default: m.LibrariesSection }))
);
const ModelsSection = lazy(() => 
  import("./sections/models-section").then(m => ({ default: m.ModelsSection }))
);
const ProvidersSection = lazy(() => 
  import("./sections/providers-section").then(m => ({ default: m.ProvidersSection }))
);
const TokensSection = lazy(() => 
  import("./sections/tokens-section").then(m => ({ default: m.TokensSection }))
);
const EnabledModelsSection = lazy(() => 
  import("./sections/enabled-models-section").then(m => ({ default: m.EnabledModelsSection }))
);

interface AiStudioContentProps {
  activeSection: string;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-muted-foreground text-sm">Carregando...</div>
    </div>
  );
}

export function AiStudioContent({ activeSection }: AiStudioContentProps) {
  // ✅ Lazy load only the active section to prevent unnecessary API calls
  const renderSection = () => {
    switch (activeSection) {
      case "team-instructions":
        return <TeamInstructionsSection />;
      case "user-instructions":
        return <UserInstructionsSection />;
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

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderSection()}
    </Suspense>
  );
}

import { ThemeToggle } from "../theme";
import { TailwindIndicator } from "./tailwind-indicator";

export function DevDesignHelper() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div className="fixed bottom-2 left-16 z-50 flex flex-row items-center space-x-1">
      <ThemeToggle />
      <TailwindIndicator />
    </div>
  );
}

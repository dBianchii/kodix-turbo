"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

import { useIsMobile } from "./hooks/use-mobile";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();
  return (
    <Sonner
      className="toaster group"
      closeButton
      duration={7000}
      pauseWhenPageIsHidden
      position={isMobile ? "top-center" : "bottom-right"}
      richColors
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          description: "group-[.toast]:text-muted-foreground",
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        },
      }}
      {...props}
    />
  );
};

// biome-ignore lint/performance/noBarrelFile: <It's safe to export it here for the bundler>
export { toast } from "sonner";
export { Toaster };

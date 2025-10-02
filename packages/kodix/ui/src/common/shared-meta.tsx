import type { Metadata, Viewport } from "next";
import { getBaseUrl } from "@kodix/shared/utils";

export const sharedMetadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
};

export const sharedViewport: Viewport = {
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
};

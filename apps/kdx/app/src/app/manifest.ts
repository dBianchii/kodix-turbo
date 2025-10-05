import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ffffff",
    description: "Software on demand",
    display: "standalone",
    icons: [
      {
        sizes: "128x128",
        src: "/favicon.ico",
        type: "image/png",
      },
    ],
    name: "Kodix",
    short_name: "Kodix",
    start_url: "/",
    theme_color: "#000000",
  };
}

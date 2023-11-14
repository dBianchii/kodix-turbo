"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export const NextAuthProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export function NextThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}

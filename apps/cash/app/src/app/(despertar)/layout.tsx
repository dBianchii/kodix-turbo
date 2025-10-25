import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Ganhe cashback em produtos e serviços",
  title: "Despertar Cashback",
};

export default function DespertarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

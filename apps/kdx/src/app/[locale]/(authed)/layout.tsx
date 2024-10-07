import React from "react";

import { Header } from "../_components/header/header";

export default function LoggedInViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

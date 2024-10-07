import React from "react";

import { StaticHeader } from "../_components/header/static-header";

export default function LoggedInViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StaticHeader />
      {children}
    </>
  );
}

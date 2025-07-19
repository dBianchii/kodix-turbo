import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { Header } from "../_components/header/header";

export default async function LoggedInViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();
  
  if (!user) {
    redirect("/signin");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}

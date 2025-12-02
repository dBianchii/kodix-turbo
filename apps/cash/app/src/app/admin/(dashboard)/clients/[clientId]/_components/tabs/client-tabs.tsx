"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kodix/ui/tabs";
import { parseAsStringLiteral, useQueryState } from "nuqs";

const tabValues = ["cashbacks", "vouchers"] as const;

interface ClientTabsProps {
  cashbacksContent: ReactNode;
  vouchersContent: ReactNode;
  redemptionButton: ReactNode;
}

export function ClientTabs({
  cashbacksContent,
  vouchersContent,
  redemptionButton,
}: ClientTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabValues).withDefault("cashbacks"),
  );

  return (
    <Tabs
      onValueChange={(v) => setTab(v as (typeof tabValues)[number])}
      value={tab}
    >
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="cashbacks">Histórico de Cashbacks</TabsTrigger>
          <TabsTrigger value="vouchers">Vale-Compras</TabsTrigger>
        </TabsList>
        {redemptionButton}
      </div>
      <TabsContent value="cashbacks">{cashbacksContent}</TabsContent>
      <TabsContent value="vouchers">{vouchersContent}</TabsContent>
    </Tabs>
  );
}

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";

import { api } from "~/trpc/server";
import { DataTableShifts } from "./_components/shifts-data-table";

export default async function ShiftsPage() {
  const t = await getTranslations();
  return (
    <main className="pt-6 md:p-6">
      <h2 className="mb-4 text-lg font-medium">{t("Shifts")}</h2>

      <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
        <DataTableCareShiftsServer />
      </Suspense>
    </main>
  );
}

async function DataTableCareShiftsServer() {
  const initialShifts = await api.app.kodixCare.getAllCareShifts();

  return <DataTableShifts initialShifts={initialShifts}></DataTableShifts>;
}

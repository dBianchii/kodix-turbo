"use client";

import { RedemptionDialogButton } from "./redemption-dialog-button";
import { useGetClientByIdSuspenseQuery } from "./utils/use-get-client-by-id-query";

export function RedemptionDialogButtonWrapper() {
  const {
    data: { client, totalAvailableCashback },
  } = useGetClientByIdSuspenseQuery();

  return (
    <RedemptionDialogButton
      availableCashback={totalAvailableCashback}
      clientId={client.id}
    />
  );
}

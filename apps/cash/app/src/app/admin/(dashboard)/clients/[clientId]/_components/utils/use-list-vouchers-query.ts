import { useParams } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useListVouchersSuspenseQuery = () => {
  const trpc = useTRPC();
  const { clientId } =
    useParams<Awaited<PageProps<"/admin/clients/[clientId]">["params"]>>();

  const { data: vouchers } = useSuspenseQuery(
    trpc.admin.voucher.list.queryOptions({ clientId }),
  );

  return vouchers;
};

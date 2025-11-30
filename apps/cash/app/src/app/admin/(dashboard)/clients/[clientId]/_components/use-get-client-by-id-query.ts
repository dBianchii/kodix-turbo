import { useParams } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ClientNotFoundError } from "./utils/not-found-error";

export const useGetClientByIdQuery = () => {
  const trpc = useTRPC();
  const { clientId } =
    useParams<Awaited<PageProps<"/admin/clients/[clientId]">["params"]>>();

  const getClientByIdQuery = useSuspenseQuery(
    trpc.admin.client.getById.queryOptions({ clientId }),
  );

  if (!getClientByIdQuery.data) {
    throw new ClientNotFoundError();
  }

  return {
    ...getClientByIdQuery,
    data: getClientByIdQuery.data,
  };
};

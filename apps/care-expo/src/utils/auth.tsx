import { useRouter } from "expo-router";

import { api } from "./api";
import { deleteExpoToken } from "./expoToken-store";
import { deleteToken, setToken } from "./session-store";
import { usePushNotifications } from "./usePushNotifications";

export const useAuth = () => {
  const { data, isLoading, isError } = api.auth.getSession.useQuery();
  return { session: data?.session, user: data?.user, isLoading, isError };
};

export const useSignIn = () => {
  const utils = api.useUtils();
  const router = useRouter();

  const mutation = api.app.kodixCare.signInByPassword.useMutation({
    onSuccess: async (sessionToken) => {
      setToken(sessionToken);

      await utils.invalidate();
      router.dismissAll();
    },
    onSettled: () => utils.invalidate(),
  });

  return mutation;
};

export const useSignOut = () => {
  const utils = api.useUtils();
  const router = useRouter();

  const mutation = api.auth.signOut.useMutation({
    onSuccess: async () => {
      await deleteToken();
      await deleteExpoToken();
      await utils.invalidate();
      router.replace("/");
    },
    onSettled: () => utils.invalidate(),
  });

  const { expoPushToken } = usePushNotifications();

  //? Here we override the mutation functions to always send the expoPushToken as default
  const mutate = (
    input?: Parameters<typeof mutation.mutate>["0"],
    options?: Parameters<typeof mutation.mutate>["1"],
  ) =>
    mutation.mutate(
      input ?? {
        expoToken: expoPushToken,
      },
      options,
    );

  const mutateAsync = (
    input?: Parameters<typeof mutation.mutateAsync>["0"],
    options?: Parameters<typeof mutation.mutateAsync>["1"],
  ) =>
    mutation.mutateAsync(
      input ?? {
        expoToken: expoPushToken,
      },
      options,
    );

  return { ...mutation, mutate, mutateAsync };
};

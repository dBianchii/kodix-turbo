import { useRouter } from "expo-router";

import { api } from "./api";
import { deleteToken, setToken } from "./session-store";

export const useAuth = () => {
  const { data, isLoading, isError } = api.auth.getSession.useQuery();
  return { session: data?.session, user: data?.user, isLoading, isError };
};

export const useSignIn = () => {
  const utils = api.useUtils();
  const router = useRouter();

  const mutation = api.user.signInByPassword.useMutation({
    onSuccess: async (sessionToken) => {
      setToken(sessionToken);

      await utils.invalidate();
      router.replace("/");
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
      await utils.invalidate();
      router.replace("/");
    },
    onSettled: () => utils.invalidate(),
  });
  return mutation;
};

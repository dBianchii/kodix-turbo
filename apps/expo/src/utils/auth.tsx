import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as Browser from "expo-web-browser";

import { api } from "./api";
import { deleteToken, setToken } from "./session-store";

export const signIn = async (signInUrl: string) => {
  const redirectTo = Linking.createURL("/login");
  const result = await Browser.openAuthSessionAsync(
    `${signInUrl}?callbackUrl=${encodeURIComponent(redirectTo)}`,
    redirectTo,
  );

  if (result.type !== "success") return result.type;

  const url = Linking.parse(result.url);
  if (url.queryParams?.notRegistered) return "userNotRegistered";

  const sessionToken = String(url.queryParams?.session_token);
  if (!sessionToken) return;

  setToken(sessionToken);
  return "success";
};

export const useUser = () => {
  const { data: session } = api.auth.getSession.useQuery();
  return session?.user ?? null;
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
  const signOut = api.auth.signOut.useMutation();
  const router = useRouter();

  return async () => {
    const res = await signOut.mutateAsync();
    if (!res.success) return;
    await deleteToken();
    await utils.invalidate();
    router.replace("/");
  };
};

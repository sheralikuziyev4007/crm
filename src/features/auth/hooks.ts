import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import * as authApi from "./api";
import type { LoginValues } from "./schemas";

export function useLogin() {
  const signIn = useAuthStore((s) => s.signIn);
  return useMutation({
    mutationFn: (values: LoginValues) => authApi.login(values),
    onSuccess: signIn,
  });
}

/** Signs out locally even if the request fails: the user asked to leave, so they leave. */
export function useLogout() {
  const queryClient = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      signOut("signed-out");
      // Never show the next user cached data of the previous one
      queryClient.clear();
    },
  });
}

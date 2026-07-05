// hooks/useAuth.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfile } from "./user.query";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetProfile();

  useEffect(() => {
    const handleForceLogout = () => {
      queryClient.setQueryData(["getUser"], null);
      queryClient.clear();
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [queryClient]);

  return {
    user: data?.data?.user ?? null,
    isAuthenticated: !!data?.data?.user,
    isLoading,
    isError,
  };
};

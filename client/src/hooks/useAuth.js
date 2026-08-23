import { useGetProfile } from "./user.query";

export const useAuth = () => {
  const { data, isLoading, isError } = useGetProfile();

  return {
    user: data?.data?.user ?? null,
    isAuthenticated: !!data?.data?.user,
    isLoading,
    isError,
  };
};

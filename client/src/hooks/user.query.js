import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserProfile,
  verifyEmail,
  verifyForgotPasswordOtp,
} from "@/api/user.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resetSessionExpired } from "@/api/Axios";
import { useUserStore } from "@/store/userStore";

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      resetSessionExpired();
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      resetSessionExpired();

      if (response?.data?.user) {
        useUserStore.getState().setUser(response.data.user);
      }

      queryClient.invalidateQueries({ queryKey: ["getUser"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      if (response?.data?.user) {
        useUserStore.getState().setUser(response.data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
    },
  });
};

export const useGetProfile = (enabled = true) => {
  return useQuery({
    queryFn: getUser,
    enabled,
    queryKey: ["getUser"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      useUserStore.getState().clearUser();
      queryClient.removeQueries({ queryKey: ["getUser"] });
      queryClient.clear();
    },
    onError: () => {
      useUserStore.getState().clearUser();
      queryClient.removeQueries({ queryKey: ["getUser"] });
      queryClient.clear();
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      useUserStore.getState().clearUser();
      queryClient.removeQueries({ queryKey: ["getUser"] });
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyForgotPasswordOtp,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
  });
};

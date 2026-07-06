import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserProfile,
  verifyForgotPasswordOtp,
} from "@/api/user.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getUser"] }),
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

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.setQueryData(["getUser"], null);
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["getUser"], null);
      queryClient.clear();
    },
    onError: () => {
      queryClient.setQueryData(["getUser"], null);
      queryClient.clear();
    },
  });
};

import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import login from "@/assets/login.png";
import { useResetPassword } from "@/hooks/user.query";
import { AuthToast } from "@/components/common/AuthToast";

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useResetPassword();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp, verified } = location?.state || {};

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  if (!email || !otp || !verified) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = (data) => {
    mutate(
      {
        email,
        otp,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (response) => {
          AuthToast.success(
            response?.message ||
              "Password reset successfully. Please log in with your new password.",
          );
          navigate("/login", { replace: true });
        },
        onError: (err) => {
          AuthToast.error(
            err?.response?.data?.message || "Failed to reset password",
          );
        },
      },
    );
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-gray-50 p-6 md:p-10">
      <div className={cn("flex flex-col gap-6 w-full max-w-5xl")}>
        <Card className="overflow-hidden p-0 shadow-xl border border-gray-200">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-10 md:p-14 flex flex-col gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white font-black text-sm">T</span>
                </div>
                <span className="font-bold text-xl tracking-tight">
                  TechHub
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Reset Password
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Create a new password for your account.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-11 pr-11 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-base font-semibold"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-11 pr-11 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="h-12 bg-black hover:bg-gray-900 text-white font-semibold text-base rounded-md transition-all duration-200 hover:shadow-lg"
              >
                {isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="relative hidden md:flex flex-col bg-gray-950">
              <img
                src={login}
                alt="Tech products"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 flex items-start gap-3 text-white">
                <ShieldCheck className="w-6 h-6 mt-0.5 text-white/80 shrink-0" />
                <div>
                  <p className="font-semibold text-base">Almost Done</p>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">
                    Choose a strong password to keep your account secure.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ResetPasswordForm;

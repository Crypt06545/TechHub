import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import login from "@/assets/login.png";
import { useForgotPassword } from "@/hooks/user.query";

import { AuthToast } from "@/components/common/AuthToast";

const ForgotPasswordForm = () => {
  // const isPending = false;
  const { mutate, isPending } = useForgotPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (response) => {
        AuthToast.success(response?.message || "OTP sent to your email");
        navigate("/verify-otp", { state: { email: data.email } });
      },
      onError: (err) => {
        AuthToast.error(err?.response?.data?.message || "Something went wrong");
      },
    });
    console.log(data);
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-gray-50 p-6 md:p-10">
      <div className={cn("flex flex-col gap-6 w-full max-w-4xl")}>
        <Card className="overflow-hidden p-0 shadow-xl border border-gray-200">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 md:p-10 flex flex-col gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white font-black text-xs">T</span>
                </div>
                <span className="font-bold text-lg tracking-tight">
                  TechHub
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter your email and we'll send you an OTP to reset your
                  password.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="h-11 bg-black hover:bg-gray-900 text-white font-semibold text-base rounded-md transition-all duration-200 hover:shadow-lg"
              >
                {isPending ? "Sending OTP..." : "Send OTP"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  to={"/login"}
                  className="font-semibold text-red-500 hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </form>

            <div className="relative hidden md:flex flex-col bg-gray-950">
              <img
                src={login}
                alt="Tech products"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 flex items-start gap-3 text-white">
                <KeyRound className="w-5 h-5 mt-0.5 text-white/80 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Account Recovery</p>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                    We'll help you get back into your account safely.
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
export default ForgotPasswordForm;

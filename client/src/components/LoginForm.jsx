import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import login from "@/assets/login.png";
import { useLoginUser } from "@/hooks/user.query";
import { AuthToast } from "./common/AuthToast";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, error } = useLoginUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (response) => {
        // console.log(response);
        AuthToast.success(response?.message || "User Login Successfully");

        if (response?.statusCode === 200) {
          navigate("/");
        }
      },

      onError: (err) => {
        AuthToast.error(
          err?.response?.data?.message || "Invalid email or password",
        );
        console.log(err);
      },
    });
  };
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0 shadow-xl border border-gray-200">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Side */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 md:p-10 flex flex-col gap-6"
          >
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">T</span>
              </div>
              <span className="font-bold text-lg tracking-tight">TechHub</span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sign in to continue shopping the latest tech products.
              </p>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-black focus:ring-black"
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
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register("remember")} />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                to={"/forgot-password"}
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-black hover:bg-gray-900 text-white font-semibold text-base rounded-md transition-all duration-200 hover:shadow-lg"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
              <Separator className="flex-1" />
              <span className="shrink-0">or continue with</span>
              <Separator className="flex-1" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-11 gap-2 border-gray-300 hover:border-gray-400 font-medium"
              >
                {/* Google */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs">Google</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-11 gap-2 border-gray-300 hover:border-gray-400 font-medium"
              >
                {/* Apple */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path
                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs">Apple</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-11 gap-2 border-gray-300 hover:border-gray-400 font-medium"
              >
                {/* Facebook */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-blue-600"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs">Facebook</span>
              </Button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to={"/register"}
                className="font-semibold text-red-500 hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </form>

          {/* Image Side */}
          <div className="relative hidden md:flex flex-col bg-gray-950">
            <img
              src={login}
              alt="Tech products"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex items-start gap-3 text-white">
              <Shield className="w-5 h-5 mt-0.5 text-white/80 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Secure Login</p>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  Your data is protected with industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom note */}
      <p className="text-center text-xs text-muted-foreground px-6">
        By clicking continue, you agree to our{" "}
        <Link
          to={"/"}
          className="underline underline-offset-4 hover:text-black"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to={"/"}
          className="underline underline-offset-4 hover:text-black"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};
export default LoginForm;

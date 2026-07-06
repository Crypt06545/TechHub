import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import login from "@/assets/login.png";
import { AuthToast } from "@/components/common/AuthToast";
import { useVerifyOtp } from "@/hooks/user.query";

// Masks an email like q34q3@gmail.com -> q****3@gmail.com
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}****@${domain}`;
  const first = name[0];
  const last = name[name.length - 1];
  return `${first}${"*".repeat(Math.max(name.length - 2, 3))}${last}@${domain}`;
};

const VerifyOtpForm = () => {
  // const isPending = false;
  const [otp, setOtp] = useState("");
  const { mutate, isPending } = useVerifyOtp();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location?.state?.email;
  // const email = "q34q3@gmail.com";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      AuthToast.error("Please enter the full 6-digit OTP");
      return;
    }
    console.log({ email, otp });

    mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          AuthToast.success(response?.message || "OTP verified");
          navigate("/reset-password", { state: { email, otp } });
        },
        onError: (err) => {
          AuthToast.error(err?.response?.data?.message || "Invalid OTP");
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
              onSubmit={handleSubmit}
              className="p-10 md:p-14 flex flex-col gap-8"
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
                  Verify OTP
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">
                    {maskEmail(email) || "your email"}
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-3 items-center py-2">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot
                      index={0}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-14 h-14 text-2xl rounded-lg"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 bg-black hover:bg-gray-900 text-white font-semibold text-base rounded-md transition-all duration-200 hover:shadow-lg"
              >
                {isPending ? "Verifying..." : "Verify OTP"}
              </Button>

              <p className="text-center text-base text-muted-foreground">
                Didn't receive the code?{" "}
                <Link
                  to={"/forgot-password"}
                  className="font-semibold text-red-500 hover:underline underline-offset-4"
                >
                  Resend
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
              <div className="absolute bottom-10 left-10 right-10 flex items-start gap-3 text-white">
                <ShieldCheck className="w-6 h-6 mt-0.5 text-white/80 shrink-0" />
                <div>
                  <p className="font-semibold text-base">Verification Step</p>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">
                    This confirms it's really you before we reset anything.
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
export default VerifyOtpForm;

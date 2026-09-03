// PATH: src/pages/VerifyEmail.jsx
// FILE: VerifyEmail.jsx

import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useVerifyEmail } from "@/hooks/user.query";

const REDIRECT_DELAY_MS = 2500;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { mutateAsync } = useVerifyEmail();

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(REDIRECT_DELAY_MS / 1000),
  );

  const hasTriedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    if (hasTriedRef.current) return;
    hasTriedRef.current = true;

    mutateAsync(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err?.response?.data?.message ||
            "This verification link is invalid or has expired.",
        );
      });
  }, [token, mutateAsync]);

  useEffect(() => {
    if (status !== "success") return;

    const redirectTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, REDIRECT_DELAY_MS);

    const tickInterval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(tickInterval);
    };
  }, [status, navigate]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {!token && (
          <>
            <XCircle className="mx-auto mb-4 h-9 w-9 text-red-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              Verification link is incomplete
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              No verification token was found in this link. Please use the link
              from your email exactly as it was sent.
            </p>
          </>
        )}

        {token && status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">
              Verifying your email
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              This will only take a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-9 w-9 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Email verified
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your account is ready. Taking you home in {secondsLeft}s…
            </p>
            <Button
              asChild
              className="mt-6 w-full bg-gray-900 text-white hover:bg-gray-700"
            >
              <Link to="/login">Go now</Link>
            </Button>
          </>
        )}

        {status === "error" && token && (
          <>
            <XCircle className="mx-auto mb-4 h-9 w-9 text-red-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              Link expired or invalid
            </h1>
            <p className="mt-1 text-sm text-gray-500">{errorMessage}</p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/register">Back to registration</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

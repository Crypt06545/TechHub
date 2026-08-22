// PATH: src/pages/VerifyEmail.jsx
// FILE: VerifyEmail.jsx

import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useVerifyEmail } from "@/hooks/user.query";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { mutate, isPending, isSuccess, isError, error } = useVerifyEmail();

  // Guard against React 18 StrictMode firing the effect twice in dev,
  // which would otherwise send two verify requests for the same token.
  const hasTriedRef = useRef(false);

  useEffect(() => {
    if (!token || hasTriedRef.current) return;
    hasTriedRef.current = true;
    mutate(token);
  }, [token, mutate]);

  const errorMessage =
    error?.response?.data?.message ||
    "This verification link is invalid or has expired.";

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

        {token && isPending && (
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

        {isSuccess && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-9 w-9 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Email verified
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your account is ready. You can log in now.
            </p>
            <Button
              asChild
              className="mt-6 w-full bg-gray-900 text-white hover:bg-gray-700"
            >
              <Link to="/login">Continue to login</Link>
            </Button>
          </>
        )}

        {isError && (
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

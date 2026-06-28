"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    api.get<{ message: string }>(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        const msg = err?.message || "";
        if (msg.includes("expired")) {
          setStatus("expired");
          setMessage("This verification link has expired.");
        } else {
          setStatus("error");
          setMessage(msg || "Verification failed. The link may be invalid.");
        }
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div>
            <div className="text-5xl mb-4">{"\u23F3"}</div>
            <h1 className="text-2xl font-bold text-[#202124]">Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-5xl mb-4">{"\u2705"}</div>
            <h1 className="text-2xl font-bold text-[#202124]">Email Verified!</h1>
            <p className="text-[#757575] mt-2">Your email has been successfully verified.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1A73E8] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-5xl mb-4">{"\u274C"}</div>
            <h1 className="text-2xl font-bold text-[#202124]">Verification Failed</h1>
            <p className="text-[#757575] mt-2">{message}</p>
          </div>
        )}

        {status === "expired" && (
          <div>
            <div className="text-5xl mb-4">{"\u23F0"}</div>
            <h1 className="text-2xl font-bold text-[#202124]">Link Expired</h1>
            <p className="text-[#757575] mt-2">This verification link has expired. Request a new one from your profile.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1A73E8] transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

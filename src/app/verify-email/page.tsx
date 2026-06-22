import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" /></div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}

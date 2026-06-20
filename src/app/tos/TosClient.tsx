"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HoverButton } from "@/components/ui/HoverButton";

export default function TosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accepting, setAccepting] = useState(false);
  const pendingData = searchParams.get("pending");

  const handleAccept = async () => {
    setAccepting(true);
    if (pendingData) {
      sessionStorage.setItem("pending_signup", pendingData);
    }
    sessionStorage.setItem("tos_accepted", "true");
    if (pendingData) {
      router.push("/signup?step=courses");
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#202124] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#757575] mb-8">Effective as of June 19, 2026</p>

        <div className="space-y-8 text-sm text-[#202124] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
            <p>
              Parking Agent is a member-to-member matching service for street parking in Long Beach, CA.
              We help members find parking more efficiently by anonymously matching their schedules
              with other members.
            </p>
            <p className="mt-2 font-semibold text-[#E94335]">
              Parking Agent does not own, sell, or in any way make money from free public parking spots.
            </p>
            <p className="mt-2">
              The app operates in accordance with Long Beach, CA city laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Purpose of the App</h2>
            <p>
              We offer our members a way to maximize efficiency when parking on the streets of Long Beach.
            </p>
            <p className="mt-2">
              Parking Agent is a member-to-member matching service for street parking. Members can:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Submit their schedule (when they leave their spot and when they return looking for a spot).</li>
              <li>Be matched anonymously with other members whose schedules complement each other.</li>
              <li>Use the system to find parking more efficiently on public streets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. No Ownership or Control of Parking Spots</h2>
            <p className="font-semibold">
              Parking Agent does not own, manage, or control any public parking spots.
            </p>
            <p className="mt-2">
              All parking spots referenced in the app are public street parking spots governed by
              Long Beach, CA parking regulations. The app does not control, reserve, or guarantee
              any specific public parking spot. Parking Agent does not charge fees for public
              parking spots themselves.
            </p>
            <p className="mt-2">
              Members are responsible for complying with all local parking laws, time limits,
              signage, and regulations.
            </p>
            <p className="mt-2 font-semibold">
              Parking Agent is not liable for:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Parking tickets, fines, or citations.</li>
              <li>Towing or loss of vehicle.</li>
              <li>Inability to find or use a parking spot.</li>
              <li>Any damages or incidents related to parking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Member Responsibilities</h2>
            <p>Members must:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate schedule information.</li>
              <li>Use the app responsibly and legally.</li>
              <li>Respect public parking rules and neighborhood norms.</li>
              <li>Not misrepresent their vehicle, schedule, or intent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Matching Service</h2>
            <p>
              Matches are anonymous: members see only anonymized IDs (e.g., "Member #1234")
              and vehicle type/size, not full names or addresses.
            </p>
            <p className="mt-2">
              Parking Agent provides a matching service but does not guarantee that a match
              will be found. Availability of matches depends on member schedules, neighborhood
              demand, and other factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Privacy and Anonymity</h2>
            <p>
              Parking Agent collects and uses personal data only as described in our
              Privacy Policy (available at /legal/privacy). Matches are anonymous:
              members see only anonymized IDs and basic vehicle information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. No Liability</h2>
            <p>
              Parking Agent is not responsible for parking tickets, towing, damages,
              or any incidents related to parking. Members use the app at their own
              risk and are responsible for their own compliance with local laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Changes to Terms</h2>
            <p>
              Parking Agent may update these Terms of Service at any time. The latest
              version will be available at /tos. Continued use of the app after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, contact: support@parkingagent.com
            </p>
          </section>
        </div>

        {pendingData && (
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-[#757575] mb-4">
              By clicking &quot;I Accept&quot;, you agree to these Terms of Service.
            </p>
            <HoverButton onClick={handleAccept} disabled={accepting} className="w-full max-w-sm mx-auto">
              {accepting ? "Redirecting..." : "I Accept"}
            </HoverButton>
          </div>
        )}
      </main>
    </div>
  );
}

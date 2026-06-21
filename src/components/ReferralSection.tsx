"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

interface ReferralStats {
  totalReferred: number;
  converted: number;
  rewarded: number;
  freeMonthsEarned: number;
  remainingForNext: number;
  totalConvertedNeeded: number;
  hasRecentFraudFlag: boolean;
}

export function ReferralSection() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ stats: ReferralStats; code: string | null; shareUrl: string | null }>("/api/referral/stats")
      .then((data) => {
        setStats(data.stats);
        setCode(data.code);
        setShareUrl(data.shareUrl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleShareSMS = useCallback(() => {
    const msg = encodeURIComponent(`Get 1 month free parking with Spotimization! Use my referral link: ${shareUrl}`);
    window.open(`sms:?&body=${msg}`, "_blank");
  }, [shareUrl]);

  const handleShareEmail = useCallback(() => {
    const subject = encodeURIComponent("Join Spotimization - Get 1 Month Free");
    const body = encodeURIComponent(`I've been using Spotimization for hassle-free street parking in Long Beach. Use my referral link to sign up and get started: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }, [shareUrl]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  const progressPct = stats ? Math.min(100, ((stats.converted % 3) / 3) * 100) : 0;
  const nextMilestone = stats ? (Math.floor((stats?.converted ?? 0) / 3) + 1) * 3 : 3;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#202124] text-xs">Refer & Earn</h3>
        <span className="text-[10px] text-[#0F9D58] font-semibold bg-[#E6F4EA] px-2 py-0.5 rounded-full">
          {stats?.freeMonthsEarned ?? 0} free months earned
        </span>
      </div>

      {/* Referral Code */}
      {code && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-center">
          <p className="text-[10px] text-[#757575] uppercase tracking-wider mb-1">Your Referral Code</p>
          <p className="text-lg font-black tracking-widest text-[#202124] select-all">{code}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-[#4285F4]">{stats?.totalReferred ?? 0}</p>
          <p className="text-[10px] text-[#757575]">Referred</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#0F9D58]">{stats?.converted ?? 0}</p>
          <p className="text-[10px] text-[#757575]">Converted</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#FBBB05]">{stats?.freeMonthsEarned ?? 0}</p>
          <p className="text-[10px] text-[#757575]">Free Months</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-[#757575] mb-1">
          <span>Progress to next free month</span>
          <span>{stats ? `${Math.min(3, (stats.converted % 3) || 3)}/3 referred` : ""}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-[#4285F4] h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {stats && stats.remainingForNext > 0 && (
          <p className="text-[10px] text-[#757575] mt-1">
            Refer {stats.remainingForNext} more to get your next free month!
          </p>
        )}
      </div>

      {/* Share Buttons */}
      <div className="space-y-1.5">
        <button onClick={handleCopy}
          className="w-full bg-[#4285F4] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#1A73E8] transition-colors">
          {copied ? "Copied!" : "Copy Referral Link"}
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={handleShareSMS}
            className="bg-[#E8F0FE] text-[#4285F4] px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#D2E3FC] transition-colors">
            Share via SMS
          </button>
          <button onClick={handleShareEmail}
            className="bg-[#E8F0FE] text-[#4285F4] px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#D2E3FC] transition-colors">
            Share via Email
          </button>
        </div>
      </div>

      {/* Fraud warning */}
      {stats?.hasRecentFraudFlag && (
        <p className="text-[10px] text-[#E94335] mt-2 text-center">
          ⚠ Multiple referrals detected in a short period. Reviews are ongoing.
        </p>
      )}
    </Card>
  );
}

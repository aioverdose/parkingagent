"use client";

import { useState, useEffect } from "react";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const wasDismissed = localStorage.getItem("pwa_dismissed") === "true";

    setIsIOS(iOS);
    setIsStandalone(standalone);
    setDismissed(wasDismissed);

    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const appInstalledHandler = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  useEffect(() => {
    if (isStandalone || installed || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [isStandalone, installed, dismissed]);

  if (!visible || isStandalone || installed || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_dismissed", "true");
    setVisible(false);
  };

  if (!isIOS && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 animate-slide-up">
        <div className="max-w-md mx-auto bg-[#1E293B] border border-[#334155] rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 7v2M12 15v2M7 12h2M15 12h2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Install Spotimization</p>
              <p className="text-[#94A3B8] text-xs mt-1">Get faster access and offline support</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleDismiss} className="flex-1 text-sm text-[#94A3B8] font-medium py-2.5 rounded-xl hover:bg-[#334155] transition-colors">Not now</button>
            <button onClick={handleInstall} className="flex-1 text-sm text-white font-bold bg-[#2563EB] py-2.5 rounded-xl hover:bg-[#1D4ED8] transition-colors">Install</button>
          </div>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 animate-slide-up">
        <div className="max-w-md mx-auto bg-[#1E293B] border border-[#334155] rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Install Spotimization</p>
              <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                Tap <span className="inline-flex items-center gap-0.5 text-white">Share <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span> then <strong className="text-white">Add to Home Screen</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleDismiss} className="flex-1 text-sm text-[#94A3B8] font-medium py-2.5 rounded-xl hover:bg-[#334155] transition-colors">Got it</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 animate-slide-up">
      <div className="max-w-md mx-auto bg-[#1E293B] border border-[#334155] rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Add to Home Screen</p>
            <p className="text-[#94A3B8] text-xs mt-1">Use your browser menu to add Spotimization to your home screen</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleDismiss} className="flex-1 text-sm text-[#94A3B8] font-medium py-2.5 rounded-xl hover:bg-[#334155] transition-colors">Dismiss</button>
        </div>
      </div>
    </div>
  );
}

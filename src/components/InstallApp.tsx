"use client";

import { useState, useEffect } from "react";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (isSafari && navigator.maxTouchPoints > 0);
    setIsIOS(iOS);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowInstall(false);
      setInstalled(true);
    });

    if (!iOS && !window.matchMedia("(display-mode: standalone)").matches) {
      const timer = setTimeout(() => setShowInstall(true), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstall(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) return null;

  return (
    <>
      {isIOS && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 animate-slide-up">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-[#202124]">Install Spotimization</p>
              <p className="text-xs text-[#757575] mt-0.5">
                Tap the Share button{" "}
                <svg className="inline w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>{" "}
                then tap <strong>Add to Home Screen</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isIOS && showInstall && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 animate-slide-up">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-[#202124]">Install Spotimization</p>
              <p className="text-xs text-[#757575] mt-0.5">Add to your home screen for the best experience</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowInstall(false)}
                className="text-xs text-[#757575] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Later</button>
              <button onClick={handleInstall}
                className="text-xs bg-[#4285F4] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#1A73E8] transition-colors">Install</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

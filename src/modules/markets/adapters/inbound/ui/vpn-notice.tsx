"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "polymarket-widget-vpn-notice-dismissed";

export function VpnNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }
    setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:inset-x-auto sm:top-6 sm:right-6 sm:justify-end"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-amber-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur dark:border-amber-900/70 dark:bg-zinc-950/95">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        >
          VPN
        </span>
        <p className="flex-1 leading-6 text-zinc-700 dark:text-zinc-300">
          Connect to a VPN before searching markets. Polymarket US may be
          blocked in some regions.
        </p>
        <button
          type="button"
          aria-label="Dismiss VPN notice"
          onClick={dismiss}
          className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

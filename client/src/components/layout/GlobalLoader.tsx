"use client";

import { Loader2 } from "lucide-react";
import { useGlobalContext } from "../../../context/global-context";

export function GlobalLoader() {
  const { globalLoading } = useGlobalContext();

  if (!globalLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="flex items-center gap-2 rounded-md border border-border bg-white border-[1px] dark:border-white border-gray-900 dark:bg-zinc-900/95 px-3 py-2 shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs sm:text-base">Loading...</span>
      </div>
    </div>
  );
}

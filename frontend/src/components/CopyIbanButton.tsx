"use client";

import { useState } from "react";

type Props = {
  iban: string;
  className?: string;
};

export function CopyIbanButton({ iban, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(iban.replace(/\s/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`pressable btn-ghost inline-flex items-center gap-2 px-4 py-2 text-xs${className ? ` ${className}` : ""}`}
    >
      {copied ? "Kopyalandı ✓" : "IBAN kopyala"}
    </button>
  );
}

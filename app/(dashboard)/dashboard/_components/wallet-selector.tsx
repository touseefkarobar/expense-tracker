"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";

import type { WalletDocument } from "@/lib/server/finance-service";

interface WalletSelectorProps {
  wallets: WalletDocument[];
  activeWalletId: string | null;
}

export function WalletSelector({ wallets, activeWalletId }: WalletSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextWalletId = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (nextWalletId) {
      params.set("wallet", nextWalletId);
    } else {
      params.delete("wallet");
    }

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  const emptyState = wallets.length === 0;

  return (
    <select
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
      value={activeWalletId ?? ""}
      onChange={handleChange}
      disabled={isPending || emptyState}
    >
      {emptyState ? (
        <option value="">Create a wallet to begin</option>
      ) : (
        wallets.map(wallet => (
          <option key={wallet.$id} value={wallet.$id}>
            {wallet.name} ({wallet.default_currency})
          </option>
        ))
      )}
    </select>
  );
}

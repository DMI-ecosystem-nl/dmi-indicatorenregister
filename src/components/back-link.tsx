"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Back link that restores the filtered catalogue view when we came from it. */
export function BackLinkInner({ fallback, label }: { fallback: string; label: string }) {
  const params = useSearchParams();
  const terug = params.get("terug");
  const href = terug && terug.startsWith("/") && !terug.startsWith("//") ? terug : fallback;
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-dmi-blue hover:underline">
      <ArrowLeft className="size-4" /> {label}
    </Link>
  );
}

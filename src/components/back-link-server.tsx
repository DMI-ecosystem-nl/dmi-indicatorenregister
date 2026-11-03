import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { BackLinkInner } from "./back-link";

export function BackLink({ fallback, label }: { fallback: string; label: string }) {
  return (
    <Suspense
      fallback={
        <Link href={fallback} className="inline-flex items-center gap-1 text-sm text-dmi-blue hover:underline">
          <ArrowLeft className="size-4" /> {label}
        </Link>
      }
    >
      <BackLinkInner fallback={fallback} label={label} />
    </Suspense>
  );
}

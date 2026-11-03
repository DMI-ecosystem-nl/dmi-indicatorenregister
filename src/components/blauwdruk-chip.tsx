import Link from "next/link";
import { getAction } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function BlauwdrukChip({ code, className }: { code: string; className?: string }) {
  const action = getAction(code);
  const chip = (
    <Link
      href={action ? `/blauwdruk/${action.slug}` : "/blauwdruk"}
      className={cn(
        "dmi-tag inline-flex h-5 items-center rounded border border-dmi-gold/60 bg-[#fdf3dc] px-1.5 text-[10px] font-medium text-[#7a5410] hover:bg-[#fbe7b8] transition-colors",
        className
      )}
    >
      {code}
    </Link>
  );
  if (!action) return chip;
  return (
    <Tooltip>
      <TooltipTrigger render={chip} />
      <TooltipContent className="max-w-sm text-xs leading-relaxed">
        {action.text.length > 220 ? `${action.text.slice(0, 220)}…` : action.text}
      </TooltipContent>
    </Tooltip>
  );
}

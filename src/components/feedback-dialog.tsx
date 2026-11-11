"use client";

import { useId, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageSquarePlus } from "lucide-react";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_FALLBACK_EMAIL,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  type FeedbackCategory,
  type FeedbackResponse,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; number?: number; url?: string }
  | { kind: "error"; message: string };

const TRIGGERS = {
  sidebar: { variant: "outline", size: "default", className: "h-9 w-full justify-start gap-2 text-dmi-navy" },
  icon: { variant: "outline", size: "icon", className: "" },
  inline: { variant: "outline", size: "lg", className: "gap-2 text-dmi-navy" },
} as const;

export function FeedbackDialog({ variant = "sidebar" }: { variant?: keyof typeof TRIGGERS }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("inhoud");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const ids = { message: useId(), hint: useId(), category: useId() };

  function reset() {
    setCategory("inhoud");
    setMessage("");
    setWebsite("");
    setStatus({ kind: "idle" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          page: `${window.location.pathname}${window.location.search}`,
          website,
        }),
      });
      const data = (await res.json().catch(() => null)) as FeedbackResponse | null;
      if (data?.ok) {
        setStatus({ kind: "sent", number: data.number, url: data.url });
      } else {
        setStatus({
          kind: "error",
          message: data?.error ?? `Versturen is mislukt. Mail het DMI-team via ${FEEDBACK_FALLBACK_EMAIL}.`,
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Versturen is mislukt. Controleer je internetverbinding en probeer het opnieuw.",
      });
    }
  }

  const trigger = TRIGGERS[variant];
  const length = message.trim().length;
  const tooShort = length < FEEDBACK_MESSAGE_MIN;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && status.kind === "sent") reset();
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant={trigger.variant}
            size={trigger.size}
            className={trigger.className}
            aria-label={variant === "icon" ? "Feedback geven" : undefined}
          />
        }
      >
        <MessageSquarePlus className="size-4" />
        {variant !== "icon" && "Feedback geven"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        {status.kind === "sent" ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-heading text-lg text-dmi-navy">
                <CheckCircle2 className="size-5 text-emerald-700" aria-hidden />
                Bedankt voor je feedback
              </DialogTitle>
              <DialogDescription>
                {status.number
                  ? `Je feedback staat op GitHub als melding #${status.number}. Het DMI-team bekijkt elke melding.`
                  : "We hebben je feedback ontvangen. Het DMI-team bekijkt elke melding."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {status.url && (
                <a
                  href={status.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
                >
                  Bekijk op GitHub <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
              <DialogClose render={<Button className="bg-dmi-navy hover:bg-dmi-blue" />}>Sluiten</DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <DialogHeader>
              <DialogTitle className="font-heading text-lg text-dmi-navy">Feedback geven</DialogTitle>
              <DialogDescription>
                Meld een fout, stel een vraag of doe een suggestie. Je bericht komt als openbare melding op GitHub.
                Zet er geen persoonsgegevens in, zoals je naam of e-mailadres.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-2">
              <legend id={ids.category} className="text-sm font-medium text-dmi-navy">
                Soort
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={ids.category}>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <label
                    key={c.value}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      category === c.value
                        ? "border-dmi-navy bg-dmi-navy text-white"
                        : "border-border bg-white text-dmi-navy hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      checked={category === c.value}
                      onChange={() => setCategory(c.value)}
                      className="sr-only"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor={ids.message} className="text-sm font-medium text-dmi-navy">
                Bericht
              </label>
              <Textarea
                id={ids.message}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={FEEDBACK_MESSAGE_MAX}
                rows={5}
                required
                aria-describedby={ids.hint}
                placeholder="Bijvoorbeeld: de bron bij deze indicator is verouderd."
                className="max-h-64 min-h-28"
              />
              <p id={ids.hint} className="flex justify-between gap-2 text-xs text-muted-foreground">
                <span>We sturen het adres van deze pagina mee.</span>
                <span className="tabular-nums">
                  {length} / {FEEDBACK_MESSAGE_MAX}
                </span>
              </p>
            </div>

            {/* Honeypot: hidden from people, often filled in by bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            {status.kind === "error" && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {status.message}
              </p>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annuleren</DialogClose>
              <Button
                type="submit"
                disabled={tooShort || status.kind === "sending"}
                className="bg-dmi-navy hover:bg-dmi-blue"
              >
                {status.kind === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {status.kind === "sending" ? "Bezig met versturen" : "Versturen"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

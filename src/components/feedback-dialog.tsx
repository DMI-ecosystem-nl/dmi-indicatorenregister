"use client";

import { useId, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageSquarePlus, ShieldAlert } from "lucide-react";
import { feedbackCopy as t } from "@/data/content/feedback";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CONTACT_MAX,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  type FeedbackCategory,
  type FeedbackRequest,
  type FeedbackResponse,
  isValidEmail,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
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
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; number?: number; url?: string; withContact: boolean }
  | { kind: "error"; message: string };

/** off → (tick box) → confirm → (yes) → on. Contact details are only sent when "on". */
type ContactMode = "off" | "confirm" | "on";

const TRIGGERS = {
  sidebar: { variant: "outline", size: "default", className: "h-9 w-full justify-start gap-2 text-dmi-navy" },
  icon: { variant: "outline", size: "icon", className: "" },
  inline: { variant: "outline", size: "lg", className: "gap-2 text-dmi-navy" },
} as const;

export function FeedbackDialog({ variant = "sidebar" }: { variant?: keyof typeof TRIGGERS }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("inhoud");
  const [message, setMessage] = useState("");
  const [contactMode, setContactMode] = useState<ContactMode>("off");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const id = useId();
  const ids = {
    message: `${id}-message`,
    hint: `${id}-hint`,
    category: `${id}-category`,
    contact: `${id}-contact`,
    confirm: `${id}-confirm`,
    name: `${id}-name`,
    email: `${id}-email`,
    emailError: `${id}-email-error`,
    organisation: `${id}-organisation`,
  };

  function clearContact() {
    setContactMode("off");
    setName("");
    setEmail("");
    setOrganisation("");
    setEmailTouched(false);
  }

  function reset() {
    setCategory("inhoud");
    setMessage("");
    setWebsite("");
    clearContact();
    setStatus({ kind: "idle" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending" || !canSend) return;
    setStatus({ kind: "sending" });
    const withContact = contactMode === "on";
    const payload: FeedbackRequest = {
      category,
      message,
      page: `${window.location.pathname}${window.location.search}`,
      website,
      ...(withContact
        ? { contact: { consent: true, email: email.trim(), name: name.trim(), organisation: organisation.trim() } }
        : {}),
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as FeedbackResponse | null;
      if (data?.ok) {
        setStatus({ kind: "sent", number: data.number, url: data.url, withContact });
      } else {
        setStatus({ kind: "error", message: data?.error ?? t.errors.failed });
      }
    } catch {
      setStatus({ kind: "error", message: t.errors.network });
    }
  }

  const trigger = TRIGGERS[variant];
  const length = message.trim().length;
  const emailValid = isValidEmail(email.trim());
  const showEmailError = contactMode === "on" && emailTouched && !emailValid;
  const canSend =
    length >= FEEDBACK_MESSAGE_MIN && contactMode !== "confirm" && (contactMode === "off" || emailValid);

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
            aria-label={variant === "icon" ? t.trigger : undefined}
          />
        }
      >
        <MessageSquarePlus className="size-4" />
        {variant !== "icon" && t.trigger}
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {status.kind === "sent" ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 pr-8 font-heading text-lg text-dmi-navy">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-700" aria-hidden />
                {t.sentTitle}
              </DialogTitle>
              <DialogDescription>
                {status.number ? t.sentWithNumber(status.number) : t.sent}
                {status.withContact && ` ${t.sentContact}`}
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
                  {t.viewOnGitHub} <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
              <DialogClose render={<Button className="bg-dmi-navy hover:bg-dmi-blue" />}>{t.close}</DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <DialogHeader>
              <DialogTitle className="pr-8 font-heading text-lg text-dmi-navy">{t.title}</DialogTitle>
              <DialogDescription>{t.intro}</DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-2">
              <legend id={ids.category} className="text-sm font-medium text-dmi-navy">
                {t.categoryLegend}
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
                    {t.categories[c.value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor={ids.message} className="text-sm font-medium text-dmi-navy">
                {t.messageLabel}
              </label>
              <Textarea
                id={ids.message}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={FEEDBACK_MESSAGE_MAX}
                rows={5}
                required
                aria-describedby={ids.hint}
                placeholder={t.messagePlaceholder}
                className="max-h-64 min-h-28"
              />
              <p id={ids.hint} className="flex justify-between gap-2 text-xs text-muted-foreground">
                <span>{t.messageHint}</span>
                <span className="tabular-nums">
                  {length} / {FEEDBACK_MESSAGE_MAX}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <label htmlFor={ids.contact} className="flex cursor-pointer items-center gap-2.5 text-sm text-dmi-navy">
                <Checkbox
                  id={ids.contact}
                  checked={contactMode === "on"}
                  onCheckedChange={(checked) => (checked ? setContactMode("confirm") : clearContact())}
                  aria-describedby={contactMode === "confirm" ? ids.confirm : undefined}
                />
                {t.contactCheckbox}
              </label>

              {contactMode === "confirm" && (
                <div
                  id={ids.confirm}
                  role="alertdialog"
                  aria-labelledby={`${ids.confirm}-title`}
                  className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
                >
                  <p id={`${ids.confirm}-title`} className="flex items-center gap-2 font-semibold">
                    <ShieldAlert className="size-4 shrink-0" aria-hidden />
                    {t.confirmTitle}
                  </p>
                  <p>{t.confirmBody}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={clearContact} autoFocus>
                      {t.confirmNo}
                    </Button>
                    <Button
                      type="button"
                      className="bg-dmi-navy hover:bg-dmi-blue"
                      onClick={() => setContactMode("on")}
                    >
                      {t.confirmYes}
                    </Button>
                  </div>
                </div>
              )}

              {contactMode === "on" && (
                <div className="space-y-3 rounded-lg border border-border bg-dmi-blue-050 p-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-dmi-navy">
                    <ShieldAlert className="size-3.5 shrink-0" aria-hidden />
                    {t.contactNotice}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor={ids.name} className="text-xs font-medium text-dmi-navy">
                        {t.name} <span className="font-normal text-muted-foreground">({t.optional})</span>
                      </label>
                      <Input
                        id={ids.name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={FEEDBACK_CONTACT_MAX}
                        autoComplete="name"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={ids.organisation} className="text-xs font-medium text-dmi-navy">
                        {t.organisation} <span className="font-normal text-muted-foreground">({t.optional})</span>
                      </label>
                      <Input
                        id={ids.organisation}
                        value={organisation}
                        onChange={(e) => setOrganisation(e.target.value)}
                        maxLength={FEEDBACK_CONTACT_MAX}
                        autoComplete="organization"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor={ids.email} className="text-xs font-medium text-dmi-navy">
                        {t.email}
                      </label>
                      <Input
                        id={ids.email}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        maxLength={FEEDBACK_CONTACT_MAX}
                        autoComplete="email"
                        required
                        aria-invalid={showEmailError || undefined}
                        aria-describedby={showEmailError ? ids.emailError : undefined}
                        className="bg-white"
                      />
                      {showEmailError && (
                        <p id={ids.emailError} className="text-xs text-destructive">
                          {t.errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
              <DialogClose render={<Button variant="outline" />}>{t.cancel}</DialogClose>
              <Button
                type="submit"
                disabled={!canSend || status.kind === "sending"}
                className="bg-dmi-navy hover:bg-dmi-blue"
              >
                {status.kind === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {status.kind === "sending" ? t.sending : t.submit}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

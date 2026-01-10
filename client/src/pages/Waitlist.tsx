import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Timer } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */

type WaitlistProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OFFER_MINUTES = 1;
const OFFER_SECONDS = OFFER_MINUTES * 60;

/* Local session tracking (browser-level) */
const WAITLIST_STORAGE_KEY = "fintra_waitlist_v1";

type WaitlistStored = {
  email: string;
  submittedAt: string; // ISO
  bonusEligible: boolean;
};

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

function formatMMSS(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function readWaitlistStored(): WaitlistStored | null {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WaitlistStored;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeWaitlistStored(email: string, bonusEligible: boolean) {
  const payload: WaitlistStored = {
    email: email.trim().toLowerCase(),
    submittedAt: new Date().toISOString(),
    bonusEligible,
  };
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(payload));
}

function BonusPill({ eligible }: { eligible: boolean }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        eligible
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-muted-foreground",
      ].join(" ")}
    >
      <span className={eligible ? "text-emerald-300" : ""}>●</span>
      {eligible ? "1000 tokens reserved" : "Bonus expired"}
    </div>
  );
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className={`confetti confetti-${i + 1}`} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SUPABASE */
/* ------------------------------------------------------------------ */

async function submitdata(email: string, bonusEligible: boolean) {
  const cleaned = email.trim().toLowerCase();

  const { error } = await supabase.from("waitlist").insert({
    email: cleaned,
    bonus_eligible: bonusEligible,
  });

  // duplicate email -> treat as success
  if ((error as any)?.code === "23505") return { ok: true as const };

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function Waitlist({ open, onOpenChange }: WaitlistProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bonusEligible, setBonusEligible] = useState<boolean | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS);

  // local session state
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [storedAt, setStoredAt] = useState<string | null>(null);

  const expired = secondsLeft <= 0;

  /* Reset / hydrate modal state on open */
  useEffect(() => {
    if (!open) return;

    const stored = readWaitlistStored();

    if (stored?.email) {
      // This browser already submitted before
      setAlreadySubmitted(true);
      setStoredEmail(stored.email);
      setStoredAt(stored.submittedAt);

      setEmail(stored.email);
      setBonusEligible(stored.bonusEligible);
      setSubmitted(true);

      // countdown irrelevant now
      setSecondsLeft(0);
      return;
    }

    // Fresh open
    setAlreadySubmitted(false);
    setStoredEmail(null);
    setStoredAt(null);

    setEmail("");
    setSubmitted(false);
    setBonusEligible(null);
    setSecondsLeft(OFFER_SECONDS);
  }, [open]);

  /* Countdown only while open + not submitted + not already submitted */
  useEffect(() => {
    if (!open || submitted || alreadySubmitted) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [open, submitted, alreadySubmitted]);

  const offerText = useMemo(() => {
    return expired
      ? "Bonus expired — join anyway"
      : "Join before the timer runs out to get 1000 free tokens";
  }, [expired]);

  const submittedLine = useMemo(() => {
    if (!alreadySubmitted) return "We’ll email you when FinTra opens access.";
    if (!storedEmail) return "This browser already joined the waitlist.";
    return `This browser already joined with ${storedEmail}.`;
  }, [alreadySubmitted, storedEmail]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            Join the FinTra Waitlist
          </DialogTitle>

          <DialogDescription className="space-y-2">
            <span className="block">Early access + updates. No spam.</span>

            {/* Countdown only before submit and only if not already submitted */}
            {!submitted && !alreadySubmitted && (
              <div
                className={[
                  "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm",
                  expired
                    ? "border-border/40 bg-muted/40 text-muted-foreground"
                    : "border-white/15 bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="font-medium">{offerText}</span>
                </div>

                {!expired && (
                  <span className="tabular-nums font-semibold">
                    {formatMMSS(secondsLeft)}
                  </span>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        {!submitted && !alreadySubmitted ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const eligible = !expired;
              setBonusEligible(eligible);

              const res = await submitdata(email, eligible);
              if (res.ok) {
                // Persist "session" locally so they can't re-submit here
                writeWaitlistStored(email, eligible);

                setAlreadySubmitted(true);
                setStoredEmail(email.trim().toLowerCase());
                setStoredAt(new Date().toISOString());
                setSubmitted(true);
              } else {
                alert(res.message);
              }
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              autoFocus
            />

            <Button type="submit" size="lg" className="w-full gap-2">
              <span className="text-white">Join Waitlist</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By joining, you agree to receive early-access emails.
            </p>
          </form>
        ) : (
          /* SUCCESS / ALREADY SUBMITTED */
          <div className="pt-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <ConfettiBurst />
                  <span className="text-xl">🎉</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {alreadySubmitted ? "Already submitted." : "You’re in."}
                    </h3>

                    {bonusEligible !== null && (
                      <BonusPill eligible={bonusEligible} />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{submittedLine}</p>

                  {bonusEligible ? (
                    <p className="text-sm">
                      <span className="text-emerald-200 font-medium">
                        1000 tokens
                      </span>{" "}
                      are reserved for you.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The bonus expired, but you’re on the waitlist.
                    </p>
                  )}

                  {alreadySubmitted && storedAt && (
                    <p className="text-xs text-muted-foreground">
                      Submitted on:{" "}
                      <span className="tabular-nums">
                        {new Date(storedAt).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full border-white/15 hover:border-white/30"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>

            {/* Optional: debug/reset button (remove in production) */}
            {/* <Button
              variant="ghost"
              className="w-full mt-2 text-xs text-muted-foreground"
              onClick={() => {
                localStorage.removeItem(WAITLIST_STORAGE_KEY);
                setAlreadySubmitted(false);
                setSubmitted(false);
                setEmail("");
                setBonusEligible(null);
                setSecondsLeft(OFFER_SECONDS);
              }}
            >
              Reset (dev only)
            </Button> */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

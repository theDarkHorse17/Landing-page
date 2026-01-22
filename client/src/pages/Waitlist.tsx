import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Timer, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */

type WaitlistProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Bonus deadline: 28 Jan 2026, 13:00:00 IST */
const BONUS_DEADLINE = new Date("2026-01-28T13:00:00+05:30");

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

function getSecondsLeft(target: Date) {
  const diffMs = target.getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

function formatDDHHMMSS(totalSeconds: number) {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function BonusPill({ eligible }: { eligible: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        eligible
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-white/50",
      ].join(" ")}
    >
      <span className={eligible ? "text-emerald-300" : "text-white/40"}>●</span>
      {eligible ? "1000 tokens reserved" : "Bonus expired"}
    </span>
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

  const [secondsLeft, setSecondsLeft] = useState(() =>
    getSecondsLeft(BONUS_DEADLINE)
  );

  // local session state
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [storedAt, setStoredAt] = useState<string | null>(null);

  const expired = secondsLeft <= 0;
  const t = useMemo(() => formatDDHHMMSS(secondsLeft), [secondsLeft]);

  const deadlineLabel = "Bonus ends: 28 Jan 2026 • 1:00 PM IST";

  useEffect(() => {
    if (!open) return;

    const stored = readWaitlistStored();
    if (stored?.email) {
      setAlreadySubmitted(true);
      setStoredEmail(stored.email);
      setStoredAt(stored.submittedAt);

      setEmail(stored.email);
      setBonusEligible(stored.bonusEligible);
      setSubmitted(true);

      setSecondsLeft(getSecondsLeft(BONUS_DEADLINE));
      return;
    }

    setAlreadySubmitted(false);
    setStoredEmail(null);
    setStoredAt(null);

    setEmail("");
    setSubmitted(false);
    setBonusEligible(null);
    setSecondsLeft(getSecondsLeft(BONUS_DEADLINE));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setSecondsLeft(getSecondsLeft(BONUS_DEADLINE));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const offerText = expired
    ? "Bonus expired — join anyway"
    : "Join now to reserve 1000 tokens";

  const submittedLine = alreadySubmitted && storedEmail
    ? `Joined with ${storedEmail}`
    : "We’ll email you when access opens.";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={[
          "relative w-full max-w-[380px] overflow-hidden rounded-3xl",
          "border border-white/10 bg-gradient-to-b from-[#0B1626] to-[#07101D]",
          "shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* top glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/14 blur-3xl" />

        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          aria-label="Close"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="relative p-5 pt-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Join the FinTra Waitlist
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Early access + updates. No spam.
            </p>
          </div>

          {/* ✅ Slim timer strip (not a big card) */}
          <div
            className={[
              "mt-5 flex items-center justify-between rounded-2xl border px-3 py-2",
              expired ? "border-white/10 bg-white/5" : "border-white/15 bg-white/5",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-white/70" />
              <div className="leading-tight">
                <div className="text-xs font-medium text-white/90">{offerText}</div>
                <div className="text-[11px] text-white/45">{deadlineLabel}</div>
              </div>
            </div>

            <div className="tabular-nums text-xs font-semibold text-white/90">
              {expired
                ? "00:00:00:00"
                : `${pad2(t.days)}:${pad2(t.hours)}:${pad2(t.minutes)}:${pad2(t.seconds)}`}
            </div>
          </div>

          {/* BODY */}
          {!submitted && !alreadySubmitted ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const eligible = !expired;
                setBonusEligible(eligible);

                const res = await submitdata(email, eligible);
                if (res.ok) {
                  writeWaitlistStored(email, eligible);

                  setAlreadySubmitted(true);
                  setStoredEmail(email.trim().toLowerCase());
                  setStoredAt(new Date().toISOString());
                  setSubmitted(true);
                } else {
                  alert(res.message);
                }
              }}
              className="mt-5 space-y-3"
            >
              <Input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full gap-2 rounded-2xl py-6 text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300"
              >
                Join Waitlist
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-[11px] text-center text-white/45">
                By joining, you agree to receive early-access emails.
              </p>
            </form>
          ) : (
            <div className="mt-5">
              {/* ✅ Single compact success card (less text, less padding) */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="relative flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    <span className="text-lg">🎉</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        You’re on the list
                      </h3>
                      {bonusEligible !== null && (
                        <BonusPill eligible={bonusEligible} />
                      )}
                    </div>

                    <p className="mt-2 text-sm text-white/60">{submittedLine}</p>

                    {alreadySubmitted && storedAt && (
                      <p className="mt-2 text-[11px] text-white/45">
                        Submitted:{" "}
                        <span className="tabular-nums">
                          {new Date(storedAt).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Only ONE primary action (Done) */}
              <Button
                className="mt-4 w-full rounded-2xl bg-emerald-400 text-black hover:bg-emerald-300 py-3 text-sm font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-3 w-full text-center text-xs text-white/45 hover:text-white/65"
              >
                Not now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

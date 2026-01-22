import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { X } from "lucide-react";

const DOWNLOAD_URL = "https://your-link-here.com"; // replace
const LAUNCH_DATE_STR = "2026-01-29T00:00:00+05:30"; // IST launch moment

type DownloadProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ---------- Countdown ----------
function getTimeLeft(target: Date) {
  const now = Date.now();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { done: false, days, hours, minutes, seconds };
}

function useCountdown(targetDate: Date) {
  const [t, setT] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = window.setInterval(() => setT(getTimeLeft(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  return t;
}

// ---------- Component ----------
export default function Download({ open, onOpenChange }: DownloadProps) {
  const launchDate = useMemo(() => new Date(LAUNCH_DATE_STR), []);
  const countdown = useCountdown(launchDate);

  const isLive = countdown.done;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)} // ✅ click outside closes
    >
      <div
        className={[
          "relative w-full max-w-[360px] overflow-hidden rounded-3xl",
          "border border-white/10 bg-gradient-to-b from-[#0B1626] to-[#07101D]",
          "shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()} // ✅ prevent closing when clicking inside
      >
        {/* subtle top glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />

        {/* Close */}
        <button
          onClick={() => onOpenChange(false)} // ✅ always closes
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
              Download FinTra
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Scan the QR on your phone to install the app.
            </p>
          </div>

          {/* Countdown Label */}
          <p className="mt-4 text-center text-xs text-emerald-400/80">
            {isLive ? "Download is live" : "Goes live in"}
          </p>

          {/* Countdown */}
          <div className="mt-3 flex justify-center gap-3 text-center">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Min", value: countdown.minutes },
              { label: "Sec", value: countdown.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="w-14 rounded-lg border border-white/10 bg-white/5 py-2"
              >
                <div className="text-base font-semibold text-white">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-white/50">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* QR Card */}
          <div className="relative mt-6 rounded-2xl bg-white p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
            {!isLive && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    Available on
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    29 Jan 2026
                  </p>
                </div>
              </div>
            )}

            <div
              className={[
                "mx-auto grid w-full max-w-[220px] place-items-center",
                !isLive ? "opacity-40 blur-[1px]" : "",
              ].join(" ")}
            >
              <QRCode value={DOWNLOAD_URL} size={210} />
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-4 text-center text-xs text-white/50">
            Android supported • iOS TestFlight coming soon
          </p>

          {/* CTA */}
          {isLive ? (
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                "mt-6 block w-full rounded-2xl py-2.5 text-center text-sm font-semibold",
                "bg-emerald-400 text-black transition hover:bg-emerald-300",
                "focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
              ].join(" ")}
            >
              Download directly
            </a>
          ) : (
            <button
              disabled
              className="mt-6 block w-full cursor-not-allowed rounded-2xl py-2.5 text-center text-sm font-semibold bg-emerald-400/40 text-black/40"
            >
              Download available on 29 Jan 2026
            </button>
          )}

          {/* Secondary */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-3 w-full text-center text-xs text-white/50 hover:text-white/70"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Wallet,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Waitlist from "./Waitlist";
import Download from "./download";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function Navbar({
  onDownload,
  onWaitlist,
}: {
  onDownload: () => void;
  onWaitlist: () => void;
}) {
  const { scrollY } = useScroll();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const HIDE_AFTER_PX = 80;
  const DELTA = 8;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const diff = latest - prev;

    setScrolled(latest > 8);

    if (latest > HIDE_AFTER_PX && diff > DELTA) setHidden(true);
    else if (diff < -DELTA) setHidden(false);

    if (latest < 8) setHidden(false);
  });

  useEffect(() => {
    if (!scrolled) setHidden(false);
  }, [scrolled]);

  return (
    <motion.nav
      initial={{ y: 0, opacity: 1 }}
      animate={
        hidden
          ? { y: -140, opacity: 0, pointerEvents: "none" as const }
          : { y: 0, opacity: 1, pointerEvents: "auto" as const }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={[
        "fixed top-0 left-0 right-0 z-50 px-6 py-4",
        scrolled
          ? "bg-background/70 backdrop-blur border-b border-border/40"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="font-display text-3xl font-semibold tracking-tight"
          >
            FinTra.
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            data-testid="link-features"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            data-testid="link-how-it-works"
          >
            How It Works
          </a>
          <a
            href="#cta"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            data-testid="link-pricing"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
         

          <Button
            size="sm"
            variant="outline"
            data-testid="button-join-waitlist"
            onClick={onWaitlist}
            type="button"
            className="gap-2 font-semibold text-[#22E3B6] border border-[#22E3B6] bg-transparent hover:bg-[#22E3B6]/10"
          >
            Join Waitlist
            
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero({ onWaitlist }: { onWaitlist: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 noise-overlay" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Powered by PULSE Intelligence
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
        >
          Your Salary-First
          <br />
          <span className="gradient-text">Financial Brain</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform how you relate to money. From salary credited to salary well
          spent — FinTra guides your decisions and reduces post-payday anxiety
          through behavioral structure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="gap-2 px-8 h-14 text-base font-medium glow-primary text-white"
            data-testid="button-start-free"
            onClick={onWaitlist}
            type="button"
          >
            Start Free
            <ArrowRight className="w-5 h-5" />
          </Button>

          <a href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 h-14 text-base border border-white/30 hover:border-white/40 transition bg-card/50 backdrop-blur-sm"
              data-testid="button-see-demo"
              type="button"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Bank-grade security</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Calendar,
    title: "Salary Day Intelligence",
    description:
      "The moment your salary lands, FinTra activates. Get personalized guidance when you're most receptive to making smart decisions.",
  },
  {
    icon: Brain,
    title: "PULSE — Your Financial Brain",
    description:
      "Not a chatbot. A behavioral intelligence layer that interprets patterns, detects risks, and nudges before damage occurs.",
  },
  {
    icon: Target,
    title: "Non-Guilt Nudges",
    description:
      "No shaming. No red panic screens. No moral judgment. We guide with calm, supportive structure — never scold.",
  },
  {
    icon: TrendingUp,
    title: "Behavioral Analytics",
    description:
      "Understand why you spend, not just what you spend. Build habits that stick with insights that matter.",
  },
  {
    icon: Wallet,
    title: "Monthly Clarity",
    description:
      "Never wonder where your money went. Get crystal-clear visibility from day one to payday.",
  },
  {
    icon: Shield,
    title: "Trust-First Design",
    description:
      "Your data is yours. We never sell, share, or manipulate. Trust isn't assumed — it's earned.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Built for <span className="gradient-text">Behavioral Change</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most apps analyze after the damage is done. FinTra exists because
            behavior changes before money is spent — not after.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group relative p-8 rounded-2xl glass-card hover:bg-white/[0.06] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Connect Your Salary",
    description:
      "Share a few details once. FinTra detects payday automatically and takes it from there.",
  },
  {
    number: "02",
    title: "Get Personalized Guidance",
    description:
      "PULSE analyzes your patterns and provides a clear plan for the month ahead.",
  },
  {
    number: "03",
    title: "Build Daily Habits",
    description:
      "Log expenses, earn Pulse Points, and watch your financial confidence grow.",
  },
  {
    number: "04",
    title: "End-Month Clarity",
    description:
      "No surprises. No anxiety. Just clear understanding of where every rupee went.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple. <span className="gradient-text">Structured.</span>{" "}
            Sustainable.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four steps from salary anxiety to salary clarity.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="flex gap-8 items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <span className="font-display text-xl font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="font-display text-2xl font-semibold mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA({ onWaitlist }: { onWaitlist: () => void }) {
  return (
    <section id="cta" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <div className="glass-card rounded-3xl p-12 md:p-16 glow-primary">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your
            <br />
            <span className="gradient-text">Relationship with Money?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of salaried professionals who've gone from paycheck
            anxiety to financial clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 px-10 h-14 text-base font-medium text-white"
              data-testid="button-cta-start"
              onClick={onWaitlist}
              type="button"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free forever plan available
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-16 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">FinTra.</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              data-testid="link-privacy"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              data-testid="link-terms"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              data-testid="link-contact"
            >
              Contact
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 FinTra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar
        onDownload={() => setDownloadOpen(true)}
        onWaitlist={() => setWaitlistOpen(true)}
      />
      <Hero onWaitlist={() => setWaitlistOpen(true)} />
      <Features />
      <HowItWorks />
      <CTA onWaitlist={() => setWaitlistOpen(true)} />
      <Footer />

      {/* ✅ Clean prop wiring. No `any`. No double props. */}
      <Waitlist open={waitlistOpen} onOpenChange={setWaitlistOpen} />
      <Download open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  );
}

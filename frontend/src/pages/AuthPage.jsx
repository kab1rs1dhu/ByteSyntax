import { SignInButton } from "@clerk/clerk-react";
import { ArrowRight, CheckIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const featureList = [
  { icon: "💬", label: "Zero-lag messaging" },
  { icon: "🎥", label: "Video standups in one click" },
  { icon: "🔐", label: "Enterprise-grade security" },
];

const AuthPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-[30%] top-[-20%] h-[560px] w-[560px] rounded-full bg-primary/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-[25%] bottom-[-35%] h-[560px] w-[600px] rounded-full bg-violet-700/25 blur-[160px]" />

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr]">
          <section className="glass-panel relative flex flex-col gap-6 rounded-[2.5rem] border border-border/50 p-8 text-left shadow-floating sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.35em] text-primary">
              <SparklesIcon className="size-3.5" />
              Byte Syntax
            </div>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Shape the way your team connects, decides, and ships— together.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              A headquarters for async work, quick decisions, and face-to-face conversations. Launch
              projects faster with focused channels, AI-powered search, and native calls.
            </p>

            <ul className="grid gap-3 sm:grid-cols-2">
              {featureList.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/10 px-4 py-3 text-sm text-foreground shadow-inner shadow-primary/5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-lg">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 rounded-2xl border border-border/50 bg-muted/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <CheckIcon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Made for high-growth teams</p>
                    <p className="text-xs text-muted-foreground">Free for up to 5 workspaces • Cancel anytime</p>
                  </div>
                </div>
                <Badge variant="secondary" className="hidden text-xs font-semibold uppercase tracking-wide sm:inline-flex">
                  SOC2 • GDPR Ready
                </Badge>
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center gap-8 rounded-[2.5rem] border border-border/60 bg-background/70 p-8 text-center shadow-floating backdrop-blur-xl sm:p-12">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Sign in to continue</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Connect your workspace in under 60 seconds. We’ll help you set up channels, invite team
                members, and sync your tools.
              </p>
            </div>

            <div className="grid gap-3">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-primary text-base font-semibold tracking-tight shadow-xl shadow-primary/30 hover:bg-primary/90"
                >
                  Continue with Clerk
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignInButton>
              <p className="text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What’s included</p>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-primary" />
                  Unlimited channels & AI summarisation
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-primary" />
                  Native calls with recordings
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-primary" />
                  SOC2, GDPR, and SSO out of the box
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

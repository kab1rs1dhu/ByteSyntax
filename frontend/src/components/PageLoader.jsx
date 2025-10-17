import { LoaderIcon } from "lucide-react";

const PageLoader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
    <div className="flex size-16 items-center justify-center rounded-full border border-border/60 bg-muted/20">
      <LoaderIcon className="size-7 animate-spin text-primary" />
    </div>
    <p className="text-sm text-muted-foreground">Warming up your workspace…</p>
  </div>
);
export default PageLoader;

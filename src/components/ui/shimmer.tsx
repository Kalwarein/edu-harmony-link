import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Shimmer = ({ className, children }: ShimmerProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

export const ShimmerCard = ({ className }: { className?: string }) => (
  <Shimmer className={cn("rounded-lg bg-muted h-20 w-full", className)} />
);

export const ShimmerText = ({ className }: { className?: string }) => (
  <Shimmer className={cn("rounded bg-muted h-4 w-3/4", className)} />
);

export const ShimmerAvatar = ({ className }: { className?: string }) => (
  <Shimmer className={cn("rounded-full bg-muted h-10 w-10", className)} />
);

export const ShimmerButton = ({ className }: { className?: string }) => (
  <Shimmer className={cn("rounded bg-muted h-10 w-24", className)} />
);
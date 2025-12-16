import { cn } from "@/lib/utils";
import { LoadingAnimation } from "./lottie";

interface LoadingProps {
  className?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { animation: 80, text: "text-sm" },
  md: { animation: 120, text: "text-base" },
  lg: { animation: 160, text: "text-lg" },
};

export function Loading({ className, message, size = "md" }: LoadingProps) {
  const { animation: animationSize, text: textSize } = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6",
        className
      )}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: animationSize, height: animationSize }}
      >
        <LoadingAnimation />
      </div>
      {message && (
        <div className="flex flex-col items-center space-y-2">
          <p className={cn("text-muted-foreground font-medium", textSize)}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

export function LoadingScreen({
  message = "Đang tải...",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col items-center space-y-8">
        <Loading message={message} size="lg" />
      </div>
    </div>
  );
}

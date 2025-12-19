import { Slot } from "@radix-ui/react-slot";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DIRECTION_CLASS_MAP = {
  up: {
    initial: "translate-y-8",
    animation: "slide-in-from-bottom-8",
  },
  down: {
    initial: "-translate-y-8",
    animation: "slide-in-from-top-8",
  },
  left: {
    initial: "translate-x-8",
    animation: "slide-in-from-right-8",
  },
  right: {
    initial: "-translate-x-8",
    animation: "slide-in-from-left-8",
  },
  none: {
    initial: "",
    animation: "",
  },
} as const;

type Direction = keyof typeof DIRECTION_CLASS_MAP;

type RevealProps = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  durationClass?: string;
  asChild?: boolean;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}>;

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  durationClass = "duration-700",
  asChild = false,
  once = true,
  threshold = 0.2,
  rootMargin = "0px",
}: RevealProps) {
  const innerRef = useRef<HTMLElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const initialTranslateClass = DIRECTION_CLASS_MAP[direction]?.initial ?? "";
  const directionalAnimation = DIRECTION_CLASS_MAP[direction]?.animation ?? "";

  const animationClasses = useMemo(
    () =>
      [
        "animate-in",
        "fade-in",
        directionalAnimation,
        durationClass,
        "ease-out",
        "fill-mode-forwards",
      ].filter(Boolean),
    [directionalAnimation, durationClass]
  );

  useEffect(() => {
    const element = innerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            element.classList.add(...animationClasses);
            element.classList.remove("opacity-0");
            if (initialTranslateClass) {
              element.classList.remove(initialTranslateClass);
            }
            element.style.animationDelay = `${delay}ms`;

            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once && hasAnimatedRef.current) {
            hasAnimatedRef.current = false;
            element.classList.remove(...animationClasses);
            element.classList.add("opacity-0");
            if (initialTranslateClass) {
              element.classList.add(initialTranslateClass);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    animationClasses,
    delay,
    initialTranslateClass,
    once,
    rootMargin,
    threshold,
  ]);

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        innerRef.current = node;
        if (node) {
          node.classList.add("opacity-0");
          if (initialTranslateClass) {
            node.classList.add(initialTranslateClass);
          }
        }
      }}
      className={cn("will-change-[transform,opacity]", className)}
    >
      {children}
    </Comp>
  );
}

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// iOS Share icon (square.and.arrow.up)
export function ShareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("", className)}
    >
      {/* Arrow pointing up */}
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      {/* Square/box at bottom */}
      <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}

// iOS Add to Home Screen icon (plus.app)
export function AddToHomeScreenIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("", className)}
    >
      {/* Rounded square */}
      <rect x="3" y="3" width="18" height="18" rx="4" />
      {/* Plus sign */}
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

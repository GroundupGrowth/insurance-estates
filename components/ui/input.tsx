import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-[#E8E8E6] bg-white px-3 py-2 text-sm text-app-ink placeholder:text-app-muted transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-[#FF5B8A]/30 focus:border-[#E8E8E6]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };

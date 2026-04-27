"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autosize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autosize, onInput, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const resize = React.useCallback(() => {
      const el = internalRef.current;
      if (!el || !autosize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autosize]);

    React.useEffect(() => {
      resize();
    }, [resize, props.value, props.defaultValue]);

    return (
      <textarea
        ref={internalRef}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
        className={cn(
          "flex w-full rounded-lg border border-[#E8E8E6] bg-white px-3 py-2 text-sm text-app-ink placeholder:text-app-muted transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[#FF5B8A]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[80px] resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

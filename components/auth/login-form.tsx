"use client";

import { useState } from "react";
import { useStackApp } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = "idle" | "sending" | "sent" | "error";

interface LoginFormProps {
  initialError?: string | null;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const app = useStackApp();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>(initialError ? "error" : "idle");
  const [message, setMessage] = useState<string | null>(initialError ?? null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMessage(null);

    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/handler/magic-link-callback`
        : undefined;

    try {
      const result = await app.sendMagicLinkEmail(email.trim().toLowerCase(), {
        callbackUrl,
      });
      if (result.status === "error") {
        setState("error");
        setMessage(result.error.message ?? "Couldn't send magic link.");
        return;
      }
      setState("sent");
      setMessage("Check your inbox for the sign-in link.");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "sending"}
        />
      </div>
      <Button type="submit" className="w-full" disabled={state === "sending" || !email}>
        {state === "sending" ? "Sending…" : "Send magic link"}
      </Button>
      {message && (
        <p
          className={
            state === "error"
              ? "text-xs text-[#8A3A3A]"
              : "text-xs text-[#3F6E3A]"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}

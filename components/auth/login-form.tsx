"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMessage(null);
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setMessage(json.error ?? "Could not send magic link.");
      return;
    }
    setState("sent");
    setMessage("Check your inbox for the sign-in link.");
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

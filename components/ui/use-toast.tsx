"use client";

import * as React from "react";

type ToastVariant = "default" | "destructive";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let localToasts: ToastItem[] = [];
const listeners: Array<(toasts: ToastItem[]) => void> = [];

function emit() {
  listeners.forEach((l) => l([...localToasts]));
}

function pushToast(t: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2);
  localToasts = [...localToasts, { id, duration: 4000, ...t }];
  emit();
  setTimeout(() => {
    localToasts = localToasts.filter((x) => x.id !== id);
    emit();
  }, t.duration ?? 4000);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(localToasts);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts,
    toast: pushToast,
    dismiss: (id: string) => {
      localToasts = localToasts.filter((x) => x.id !== id);
      emit();
    },
  };
}

export const toast = pushToast;

export type { ToastItem };
export { ToastContext };

"use client";

import { useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  upsertSocialChannel,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
} from "@/lib/actions/socials";
import { toast } from "@/components/ui/use-toast";
import { PLATFORM_COLOR } from "@/lib/constants";
import type {
  SocialChannel,
  SocialCompetitor,
  SocialPlatform,
} from "@/lib/types";

interface Props {
  platform: SocialPlatform;
  initialChannel: SocialChannel | null;
  initialCompetitors: SocialCompetitor[];
}

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function PlatformOverview({
  platform,
  initialChannel,
  initialCompetitors,
}: Props) {
  const [driveUrl, setDriveUrl] = useState(initialChannel?.drive_url ?? "");
  const [accountUrl, setAccountUrl] = useState(initialChannel?.account_url ?? "");
  const [notes, setNotes] = useState(initialChannel?.notes ?? "");
  const [competitors, setCompetitors] = useState<SocialCompetitor[]>(initialCompetitors);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const flush = async (patch: {
    drive_url?: string | null;
    account_url?: string | null;
    notes?: string | null;
  }) => {
    try {
      await upsertSocialChannel(platform, {
        drive_url: driveUrl.trim() || null,
        account_url: accountUrl.trim() || null,
        notes: notes.trim() || null,
        ...patch,
      });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const addCompetitor = async () => {
    const n = name.trim();
    if (!n) return;
    try {
      const created = await createCompetitor({
        platform,
        name: n,
        url: url.trim() || null,
      });
      setCompetitors((cur) => [...cur, created]);
      setName("");
      setUrl("");
    } catch {
      toast({ title: "Couldn't add competitor", variant: "destructive" });
    }
  };

  const persistCompetitor = async (
    id: string,
    patch: { name?: string; url?: string | null; notes?: string | null },
  ) => {
    setCompetitors((cur) =>
      cur.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    try {
      await updateCompetitor(id, patch);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const removeCompetitor = async (id: string) => {
    const prev = competitors;
    setCompetitors((cur) => cur.filter((c) => c.id !== id));
    try {
      await deleteCompetitor(id);
    } catch {
      toast({ title: "Couldn't remove", variant: "destructive" });
      setCompetitors(prev);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="rounded-2xl border border-app-border bg-white p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: PLATFORM_COLOR[platform] }}
          />
          <h2 className="text-base font-semibold text-app-ink">Channel info</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ch-account">Account URL</Label>
          <div className="flex items-center gap-2">
            <Input
              id="ch-account"
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
              onBlur={() =>
                accountUrl.trim() !== (initialChannel?.account_url ?? "") &&
                flush({ account_url: accountUrl.trim() || null })
              }
              placeholder="https://instagram.com/yourhandle"
            />
            {accountUrl.trim() && (
              <a
                href={accountUrl.trim()}
                target="_blank"
                rel="noreferrer"
                className="text-app-muted hover:text-app-ink"
                aria-label="Open account"
              >
                <ExternalLink size={16} strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ch-drive">Google Drive</Label>
          <div className="flex items-center gap-2">
            <Input
              id="ch-drive"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              onBlur={() =>
                driveUrl.trim() !== (initialChannel?.drive_url ?? "") &&
                flush({ drive_url: driveUrl.trim() || null })
              }
              placeholder="https://drive.google.com/drive/folders/…"
            />
            {driveUrl.trim() && (
              <a
                href={driveUrl.trim()}
                target="_blank"
                rel="noreferrer"
                className="text-app-muted hover:text-app-ink"
                aria-label="Open Drive"
              >
                <ExternalLink size={16} strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ch-notes">Notes</Label>
          <Textarea
            id="ch-notes"
            autosize
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() =>
              notes.trim() !== (initialChannel?.notes ?? "") &&
              flush({ notes: notes.trim() || null })
            }
            placeholder="Voice, do's and don'ts, posting cadence, etc."
            className="min-h-[100px]"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-app-border bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-app-ink">Competitors</h2>

        <ul className="flex flex-col divide-y divide-app-border rounded-lg border border-app-border bg-white">
          {competitors.length === 0 && (
            <li className="px-3 py-3 text-xs text-app-muted">
              No competitors yet. Add one below.
            </li>
          )}
          {competitors.map((c) => (
            <li key={c.id} className="px-3 py-2 space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={c.name}
                  onChange={(e) =>
                    setCompetitors((cur) =>
                      cur.map((x) =>
                        x.id === c.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                  onBlur={(e) =>
                    e.target.value !== c.name &&
                    persistCompetitor(c.id, { name: e.target.value })
                  }
                  className="h-8 text-sm"
                  placeholder="Name"
                />
                <Input
                  value={c.url ?? ""}
                  onChange={(e) =>
                    setCompetitors((cur) =>
                      cur.map((x) =>
                        x.id === c.id ? { ...x, url: e.target.value } : x,
                      ),
                    )
                  }
                  onBlur={(e) =>
                    (e.target.value || null) !== (c.url ?? null) &&
                    persistCompetitor(c.id, { url: e.target.value || null })
                  }
                  className="h-8 text-sm md:flex-1"
                  placeholder="https://…"
                />
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-app-muted hover:text-app-ink"
                    aria-label={`Open ${c.name}`}
                  >
                    <ExternalLink size={14} strokeWidth={1.75} />
                  </a>
                )}
                <button
                  onClick={() => removeCompetitor(c.id)}
                  className="text-app-muted hover:text-app-ink"
                  aria-label="Remove"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>
              {c.url && (
                <p className="text-[11px] text-app-muted truncate pl-1">
                  {hostnameOf(c.url)}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col md:flex-row gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addCompetitor();
              }
            }}
            placeholder="Name"
            className="md:w-40"
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addCompetitor();
              }
            }}
            placeholder="URL (optional)"
            className="md:flex-1"
          />
          <Button variant="secondary" size="sm" onClick={addCompetitor} disabled={!name.trim()}>
            <Plus size={14} strokeWidth={2} />
            Add
          </Button>
        </div>
      </section>
    </div>
  );
}

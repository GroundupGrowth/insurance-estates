import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return NextResponse.json(
      { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 },
    );
  }

  const admin = createSbClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: allowed, error: allowedErr } = await admin
    .from("allowed_emails")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  if (allowedErr) {
    return NextResponse.json({ error: "Could not verify email." }, { status: 500 });
  }
  if (!allowed) {
    return NextResponse.json(
      { error: "This email isn't permitted to sign in." },
      { status: 403 },
    );
  }

  const supabase = await createServerSupabase();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(req.url).origin ??
    "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

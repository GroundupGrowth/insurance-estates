interface LogoProps {
  size?: "sm" | "md";
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ size = "md", showWordmark = true, className }: LogoProps) {
  const dim = size === "sm" ? 24 : 28;
  const fontSize = size === "sm" ? 9 : 11;
  return (
    <span className={["inline-flex items-center gap-2", className ?? ""].join(" ")}>
      <span
        className="inline-flex items-center justify-center rounded-md font-semibold text-white tracking-tight"
        style={{
          width: dim,
          height: dim,
          fontSize,
          backgroundColor: "#2E5A87",
        }}
        aria-hidden
      >
        I&amp;E
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold tracking-tight text-app-ink">
            Insurance &amp; Estates
          </span>
          <span className="text-[10px] text-app-muted">PM Dashboard</span>
        </span>
      )}
    </span>
  );
}

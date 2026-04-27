interface ProgressDonutProps {
  percent: number;
  size?: number;
}

export function ProgressDonut({ percent, size = 180 }: ProgressDonutProps) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="#F0EFEC"
          strokeWidth={4}
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="#FF5B8A"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[40px] font-semibold tracking-tight tabular-nums">
          {clamped}
          <span className="text-[18px] font-medium text-app-muted">%</span>
        </span>
      </div>
    </div>
  );
}

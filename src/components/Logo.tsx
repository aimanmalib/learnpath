/** LearnPath mark: a winding path from a starting point to a goal. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path
        d="M9.5 23c0-4.2 2.6-6 6.5-6s6.5-1.8 6.5-6"
        stroke="var(--on-brand)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.1 4.2"
        fill="none"
      />
      <circle cx="9.5" cy="23" r="2.7" fill="var(--on-brand)" />
      <circle cx="22.5" cy="10" r="3.3" fill="var(--on-brand)" />
      <circle cx="22.5" cy="10" r="1.4" fill="var(--brand)" />
    </svg>
  );
}

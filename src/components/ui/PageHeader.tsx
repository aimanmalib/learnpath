import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-title font-semibold text-ink">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { LucideIcon, Activity } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Activity,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-dashed border-navy-800 flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-sports-green/10 border border-sports-green/20 flex items-center justify-center text-sports-green mb-4 shadow-lg shadow-sports-green/5">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-sports-green/20"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-sports-green/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

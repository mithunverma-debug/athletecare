import React from "react";

export function LoadingSkeleton({ className = "h-24 w-full" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-navy-850/60 border border-navy-800 rounded-xl ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-navy-800 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-navy-800 rounded-full"></div>
      </div>
      <div className="h-8 bg-navy-800 rounded w-1/2"></div>
      <div className="h-3 bg-navy-800 rounded w-3/4"></div>
    </div>
  );
}

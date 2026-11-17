import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface DisclaimerBannerProps {
  type?: "info" | "warning";
  compact?: boolean;
}

export function DisclaimerBanner({ type = "info", compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
        <Info className="w-4 h-4 text-sports-green shrink-0" />
        <span>
          Educational wellness tracking platform. Not a medical diagnosis, emergency, or prescription system.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${
      type === "warning" 
        ? "bg-amber-950/20 border-amber-900/50 text-amber-200" 
        : "bg-navy-900/80 border-navy-800 text-slate-300"
    } flex items-start gap-3 text-sm`}>
      {type === "warning" ? (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-5 h-5 text-sports-green shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium text-slate-200">
          Educational Demonstration & Wellness Platform
        </p>
        <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
          AthleteCare provides indicative wellness and athletic readiness tracking. It is strictly not intended for medical diagnosis, emergency medical response, or prescription of treatments. Athletes with injuries or persistent pain must seek certified sports medical attention.
        </p>
      </div>
    </div>
  );
}

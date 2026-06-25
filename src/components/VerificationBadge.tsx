import React from "react";
import { CheckCircle, FileText, HelpCircle } from "lucide-react";
import { VerificationStatus } from "../types";

export interface VerificationBadgeProps {
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
}

export function VerificationBadge({
  status,
  verifiedBy,
  verifiedDate,
  onClick,
  size = "sm"
}: VerificationBadgeProps) {
  let bgColor = "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-150/70";
  let iconColor = "text-slate-400";
  let label = "Unverified";

  if (status === "tray-verified") {
    bgColor = "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/85";
    iconColor = "text-emerald-600";
    label = "Tray-Verified";
  } else if (status === "source-verified") {
    bgColor = "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/85";
    iconColor = "text-amber-600";
    label = "Source-Verified";
  }

  const paddingClass =
    size === "sm"
      ? "px-1.5 py-0.5 text-[9px]"
      : size === "md"
      ? "px-2 py-1 text-xs"
      : "px-3 py-1.5 text-sm";
  
  const sizeIcon = size === "sm" ? 11 : size === "md" ? 14 : 16;
  
  let iconElement = <HelpCircle size={sizeIcon} className={iconColor} />;
  if (status === "tray-verified") {
    iconElement = <CheckCircle size={sizeIcon} className={`${iconColor} stroke-[2.5]`} />;
  } else if (status === "source-verified") {
    iconElement = <FileText size={sizeIcon} className={iconColor} />;
  }

  const badgeElement = (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-bold font-sans rounded-md border transition shadow-3xs cursor-pointer uppercase tracking-tight select-none ${paddingClass} ${bgColor}`}
    >
      {iconElement}
      <span>{label}</span>
    </span>
  );

  return badgeElement;
}

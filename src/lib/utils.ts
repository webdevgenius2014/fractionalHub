import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function calculateCommission(
  subtotal: number,
  companyPct: number,
  candidatePct: number
) {
  const companyFee = Math.round(subtotal * (companyPct / 100));
  const candidateFee = Math.round(subtotal * (candidatePct / 100));
  const totalCharge = subtotal + companyFee;
  const candidatePayout = subtotal - candidateFee;
  const platformRevenue = companyFee + candidateFee;

  return {
    subtotal,
    companyFee,
    candidateFee,
    totalCharge,
    candidatePayout,
    platformRevenue,
  };
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export const ROLE_OPTIONS = ["CTO", "CMO", "CPO", "CFO", "COO", "CHRO", "CRO"] as const;
export const INDUSTRY_OPTIONS = [
  "SaaS", "Fintech", "Healthcare", "E-commerce", "Marketplace", "Deep Tech",
  "EdTech", "Media", "Retail", "Manufacturing", "Real Estate", "Consulting",
] as const;
export const COMPANY_STAGE_OPTIONS = [
  "Pre-seed", "Seed", "Series A", "Series B+",
] as const;
export const COMPANY_SIZE_OPTIONS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+",
] as const;

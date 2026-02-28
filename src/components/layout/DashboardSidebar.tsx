"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, User, MessageSquare, DollarSign,
  CreditCard, Settings, Briefcase, PlusCircle, Users, TrendingUp,
  Shield, BarChart2, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const candidateLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
  { href: "/dashboard/payouts", label: "Payouts", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const companyLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/dashboard/jobs/new", label: "Post a Job", icon: PlusCircle },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/transactions", label: "Transactions", icon: TrendingUp },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: BarChart2 },
  { href: "/admin/commission", label: "Commission Rates", icon: DollarSign },
  { href: "/admin/commission/history", label: "Rate History", icon: History },
  { href: "/admin/transactions", label: "Transactions", icon: TrendingUp },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminLinks : profile?.user_type === "company" ? companyLinks : candidateLinks;

  return (
    <aside className="w-64 shrink-0 border-r bg-background h-full min-h-screen">
      <div className="p-4 border-b">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Admin Panel</p>
              <p className="text-xs text-muted-foreground">FractionalHub</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-sm">
              {profile?.user_type === "company" ? "Company" : "Executive"} Dashboard
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        )}
      </div>

      <nav className="p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href ||
            (link.href !== "/dashboard" && link.href !== "/admin/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

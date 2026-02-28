"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Users, Briefcase, DollarSign, TrendingUp, UserCheck, Building2 } from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalCandidates: number;
  totalCompanies: number;
  totalJobs: number;
  openJobs: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, totalCandidates: 0, totalCompanies: 0,
    totalJobs: 0, openJobs: 0, totalTransactions: 0, totalRevenue: 0, pendingRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [
      { count: totalUsers },
      { count: totalCandidates },
      { count: totalCompanies },
      { count: totalJobs },
      { count: openJobs },
      { data: transactions },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("candidate_profiles").select("*", { count: "exact", head: true }),
      supabase.from("company_profiles").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("transactions").select("total_platform_fee_amount, status"),
    ]);

    const txData = transactions ?? [];
    const totalRevenue = txData
      .filter((t) => t.status === "payout_succeeded" || t.status === "charge_succeeded")
      .reduce((sum, t) => sum + (t.total_platform_fee_amount ?? 0), 0);
    const pendingRevenue = txData
      .filter((t) => !["payout_succeeded", "charge_failed", "refunded"].includes(t.status))
      .reduce((sum, t) => sum + (t.total_platform_fee_amount ?? 0), 0);

    setStats({
      totalUsers: totalUsers ?? 0,
      totalCandidates: totalCandidates ?? 0,
      totalCompanies: totalCompanies ?? 0,
      totalJobs: totalJobs ?? 0,
      openJobs: openJobs ?? 0,
      totalTransactions: txData.length,
      totalRevenue,
      pendingRevenue,
    });
    setLoading(false);
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Executives", value: stats.totalCandidates, icon: UserCheck, color: "text-green-600" },
    { label: "Companies", value: stats.totalCompanies, icon: Building2, color: "text-purple-600" },
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-orange-600" },
    { label: "Open Jobs", value: stats.openJobs, icon: TrendingUp, color: "text-cyan-600" },
    { label: "Transactions", value: stats.totalTransactions, icon: DollarSign, color: "text-rose-600" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-700", isCurrency: true },
    { label: "Pending Revenue", value: formatCurrency(stats.pendingRevenue), icon: TrendingUp, color: "text-yellow-600", isCurrency: true },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Executive-to-Company Ratio</span>
              <span className="font-medium">
                {stats.totalCompanies > 0
                  ? `${(stats.totalCandidates / stats.totalCompanies).toFixed(1)}:1`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job Fill Rate</span>
              <span className="font-medium">
                {stats.totalJobs > 0
                  ? `${(((stats.totalJobs - stats.openJobs) / stats.totalJobs) * 100).toFixed(0)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue per Transaction</span>
              <span className="font-medium">
                {stats.totalTransactions > 0
                  ? formatCurrency(stats.totalRevenue / stats.totalTransactions)
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/commission" className="block p-3 rounded-md bg-muted/30 hover:bg-muted text-sm font-medium">
              Adjust Commission Rates →
            </a>
            <a href="/admin/transactions" className="block p-3 rounded-md bg-muted/30 hover:bg-muted text-sm font-medium">
              View All Transactions →
            </a>
            <a href="/admin/users" className="block p-3 rounded-md bg-muted/30 hover:bg-muted text-sm font-medium">
              Manage Users →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

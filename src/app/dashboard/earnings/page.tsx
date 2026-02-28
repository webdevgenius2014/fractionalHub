"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import type { Transaction } from "@/types/database";

export default function EarningsPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchEarnings();
  }, [profile]);

  const fetchEarnings = async () => {
    if (!profile) return;

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", profile.id)
      .single();

    if (!candidateProfile) { setLoading(false); return; }

    const { data } = await supabase
      .from("transactions")
      .select("*, application:applications(*, job:jobs(title, company:company_profiles(company_name)))")
      .eq("candidate_id", candidateProfile.id)
      .order("created_at", { ascending: false });

    setTransactions((data as unknown as Transaction[]) ?? []);
    setLoading(false);
  };

  const totalEarned = transactions
    .filter((t) => t.status === "payout_succeeded")
    .reduce((sum, t) => sum + t.candidate_payout_amount, 0);

  const pending = transactions
    .filter((t) => ["payout_pending", "payout_initiated", "charge_succeeded"].includes(t.status))
    .reduce((sum, t) => sum + t.candidate_payout_amount, 0);

  const statusColors: Record<string, string> = {
    payout_succeeded: "success",
    payout_pending: "warning",
    payout_initiated: "info",
    charge_succeeded: "info",
    payout_failed: "destructive",
    refunded: "outline",
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your earnings from fractional engagements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Pending Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Engagements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No earnings yet. Apply to jobs to get started.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-semibold">{(tx as any).application?.job?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {(tx as any).application?.job?.company?.company_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(tx.candidate_payout_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      After {tx.candidate_commission_percentage}% fee ({formatCurrency(tx.candidate_fee_amount)})
                    </p>
                    <Badge variant={(statusColors[tx.status] as any) ?? "outline"}>
                      {tx.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, DollarSign } from "lucide-react";
import type { Transaction } from "@/types/database";

export default function TransactionsPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchTransactions();
  }, [profile]);

  const fetchTransactions = async () => {
    if (!profile) return;

    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", profile.id)
      .single();

    if (!companyProfile) { setLoading(false); return; }

    const { data } = await supabase
      .from("transactions")
      .select("*, application:applications(*, job:jobs(title), candidate:candidate_profiles(user:users(*)))")
      .eq("company_id", companyProfile.id)
      .order("created_at", { ascending: false });

    setTransactions((data as unknown as Transaction[]) ?? []);
    setLoading(false);
  };

  const totalCharged = transactions
    .filter((t) => t.status === "charge_succeeded" || t.status === "payout_succeeded")
    .reduce((sum, t) => sum + t.total_charge_amount, 0);

  const statusColors: Record<string, string> = {
    pending_charge: "warning", charge_initiated: "info", charge_succeeded: "success",
    charge_failed: "destructive", payout_succeeded: "success", payout_failed: "destructive",
    refunded: "outline",
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Payment history for all engagements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalCharged)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No transactions yet. Accept a candidate to begin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const candidateUser = (tx as any).application?.candidate?.user;
            return (
              <Card key={tx.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="font-semibold">{(tx as any).application?.job?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidateUser ? `${candidateUser.first_name} ${candidateUser.last_name}` : "Candidate"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">{formatCurrency(tx.total_charge_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Subtotal: {formatCurrency(tx.subtotal_amount)} + {formatCurrency(tx.company_fee_amount)} fee
                      </p>
                      <Badge variant={(statusColors[tx.status] as any) ?? "outline"}>
                        {tx.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

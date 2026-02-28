"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Transaction } from "@/types/database";

const statusColors: Record<string, string> = {
  pending_charge: "warning", charge_initiated: "info", charge_succeeded: "success",
  charge_failed: "destructive", payout_pending: "warning", payout_initiated: "info",
  payout_succeeded: "success", payout_failed: "destructive", refunded: "outline",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from("transactions")
      .select(`
        *,
        application:applications(*, job:jobs(title)),
        company:company_profiles(company_name),
        candidate:candidate_profiles(user:users(first_name, last_name))
      `)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setTransactions((data as unknown as Transaction[]) ?? []);
    setLoading(false);
  };

  const totalRevenue = transactions
    .filter((t) => ["charge_succeeded", "payout_succeeded"].includes(t.status))
    .reduce((sum, t) => sum + t.total_platform_fee_amount, 0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Transactions</h1>
        <p className="text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} · Platform revenue: {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_charge">Pending Charge</SelectItem>
            <SelectItem value="charge_succeeded">Charge Succeeded</SelectItem>
            <SelectItem value="charge_failed">Charge Failed</SelectItem>
            <SelectItem value="payout_succeeded">Payout Succeeded</SelectItem>
            <SelectItem value="payout_failed">Payout Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No transactions found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions
            .filter((tx) =>
              search === "" ||
              ((tx as any).application?.job?.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
              ((tx as any).company?.company_name ?? "").toLowerCase().includes(search.toLowerCase())
            )
            .map((tx) => {
              const candidateUser = (tx as any).candidate?.user;
              return (
                <Card key={tx.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{(tx as any).application?.job?.title}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{(tx as any).company?.company_name}</span>
                          <span>→</span>
                          <span>
                            {candidateUser ? `${candidateUser.first_name} ${candidateUser.last_name}` : "Executive"}
                          </span>
                          <span>{formatDate(tx.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold">{formatCurrency(tx.total_charge_amount)}</p>
                        <p className="text-xs text-green-600">
                          Platform: {formatCurrency(tx.total_platform_fee_amount)}
                        </p>
                        <Badge variant={(statusColors[tx.status] as any) ?? "outline"} className="text-xs">
                          {tx.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    {tx.stripe_payment_intent_id && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        PI: {tx.stripe_payment_intent_id}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

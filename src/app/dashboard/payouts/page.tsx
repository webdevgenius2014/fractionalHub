"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, ExternalLink, AlertCircle } from "lucide-react";

export default function PayoutsPage() {
  const { profile } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    const { data: cp } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    if (cp) {
      setCandidateProfile(cp);
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("candidate_id", cp.id)
        .in("status", ["payout_succeeded", "payout_initiated", "payout_pending"])
        .order("payout_date", { ascending: false });
      setTransactions(txs ?? []);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Manage your payout account and withdrawal history</p>
      </div>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Payout Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-16 bg-muted rounded animate-pulse" />
          ) : candidateProfile?.stripe_account_verified ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Stripe Connect Active</p>
                  <p className="text-sm text-muted-foreground">Account ID: {candidateProfile.stripe_connected_account_id}</p>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-yellow-800">Payout account not set up</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You need to connect a Stripe account to receive payouts when you complete work.
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Connect Stripe Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payout History</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No payouts yet. Complete engagements to earn money.</p>
            </CardContent>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{formatCurrency(tx.candidate_payout_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.payout_date ? formatDate(tx.payout_date) : "Pending"}
                  </p>
                </div>
                <Badge variant={tx.status === "payout_succeeded" ? "success" : "warning"}>
                  {tx.status.replace(/_/g, " ")}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

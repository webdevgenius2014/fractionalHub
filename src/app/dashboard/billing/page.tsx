"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function BillingPage() {
  const { profile } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchBillingData();
  }, [profile]);

  const fetchBillingData = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();
    setCompanyProfile(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your payment methods and billing information</p>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Payment Method
          </CardTitle>
          <CardDescription>
            Used to pay for fractional executive engagements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-16 bg-muted rounded animate-pulse" />
          ) : companyProfile?.payment_method_added ? (
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Default</Badge>
                <Button size="sm" variant="ghost">Update</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-yellow-800">No payment method added</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Add a payment method to accept candidates and initiate engagements.
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processor</CardTitle>
          <CardDescription>Payments are processed securely via Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Stripe Integration Active</p>
              <p className="text-xs text-muted-foreground">
                All payments are secured with industry-standard encryption
              </p>
            </div>
          </div>
          <a
            href="https://billing.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Manage billing on Stripe <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Commission Info */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>FractionalHub charges a <strong>5% platform fee</strong> on top of the agreed rate when you accept a candidate.</p>
          <p>Example: For a $5,000 engagement, you will be charged <strong>$5,250</strong> ($5,000 + $250 fee).</p>
          <p>The executive receives $4,750 after their 5% fee.</p>
        </CardContent>
      </Card>
    </div>
  );
}

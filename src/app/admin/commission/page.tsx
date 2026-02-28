"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, calculateCommission } from "@/lib/utils";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import type { CommissionConfig } from "@/types/database";

export default function AdminCommissionPage() {
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [companyPct, setCompanyPct] = useState("5.00");
  const [candidatePct, setCandidatePct] = useState("5.00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  // Preview values
  const previewAmounts = [5000, 10000, 25000];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("commission_config")
      .select("*")
      .eq("is_active", true)
      .single();

    const cfg = data as CommissionConfig | null;
    if (cfg) {
      setConfig(cfg);
      setCompanyPct(cfg.company_commission_percentage.toString());
      setCandidatePct(cfg.candidate_commission_percentage.toString());
      setNotes(cfg.notes ?? "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyVal = parseFloat(companyPct);
    const candidateVal = parseFloat(candidatePct);

    if (isNaN(companyVal) || isNaN(candidateVal) || companyVal < 0 || candidateVal < 0 ||
        companyVal > 50 || candidateVal > 50) {
      setMessage({ type: "error", text: "Commission rates must be between 0% and 50%." });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("commission_config")
      .update({
        company_commission_percentage: companyVal,
        candidate_commission_percentage: candidateVal,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("is_active", true);

    if (error) {
      setMessage({ type: "error", text: `Failed to update: ${error.message}` });
    } else {
      setMessage({ type: "success", text: "Commission rates updated successfully. New rates apply to all future engagements." });
      await fetchConfig();
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return <div className="p-8"><div className="h-64 bg-muted rounded animate-pulse" /></div>;
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commission Rates</h1>
        <p className="text-muted-foreground">
          Adjust the platform commission rates. Changes apply to new engagements only.
        </p>
      </div>

      {/* Current Config */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Current Active Rates</p>
              <p className="text-sm text-muted-foreground">
                Company: <strong>{config?.company_commission_percentage}%</strong> ·
                Executive: <strong>{config?.candidate_commission_percentage}%</strong> ·
                Total: <strong>{(config?.company_commission_percentage ?? 0) + (config?.candidate_commission_percentage ?? 0)}%</strong>
              </p>
            </div>
            <Badge variant="success" className="ml-auto">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Commission Rates</CardTitle>
          <CardDescription>
            Changes will apply to engagements created after this update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`flex items-start gap-2 text-sm rounded-md px-3 py-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-destructive/10 text-destructive"
            }`}>
              {message.type === "success"
                ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              }
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyPct">Company Commission (%)</Label>
              <div className="relative">
                <Input
                  id="companyPct"
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={companyPct}
                  onChange={(e) => setCompanyPct(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Added on top of agreed rate</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidatePct">Executive Commission (%)</Label>
              <div className="relative">
                <Input
                  id="candidatePct"
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={candidatePct}
                  onChange={(e) => setCandidatePct(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Deducted from agreed rate</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Q4 promotional rates, adjusted for new market..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Update Commission Rates"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Preview</CardTitle>
          <CardDescription>See how new rates would affect payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Agreed Rate</th>
                  <th className="text-right p-3 font-medium">Company Pays</th>
                  <th className="text-right p-3 font-medium">Exec Receives</th>
                  <th className="text-right p-3 font-medium">Platform Earns</th>
                </tr>
              </thead>
              <tbody>
                {previewAmounts.map((amount) => {
                  const calc = calculateCommission(
                    amount * 100,
                    parseFloat(companyPct) || 0,
                    parseFloat(candidatePct) || 0
                  );
                  return (
                    <tr key={amount} className="border-t">
                      <td className="p-3">{formatCurrency(amount * 100)}</td>
                      <td className="p-3 text-right font-medium text-primary">
                        {formatCurrency(calc.totalCharge)}
                      </td>
                      <td className="p-3 text-right font-medium text-green-600">
                        {formatCurrency(calc.candidatePayout)}
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {formatCurrency(calc.platformRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

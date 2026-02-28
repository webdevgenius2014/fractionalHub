"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { History } from "lucide-react";
import type { CommissionConfig } from "@/types/database";

export default function CommissionHistoryPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("commission_config")
        .select("*")
        .order("updated_at", { ascending: false });
      setConfigs((data as unknown as CommissionConfig[]) ?? []);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Commission Rate History</h1>
          <p className="text-muted-foreground">View all commission rate changes over time</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
        </div>
      ) : configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No commission history found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-xs">Company Rate</p>
                          <p className="font-semibold text-lg">{config.company_commission_percentage}%</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-xs">Executive Rate</p>
                          <p className="font-semibold text-lg">{config.candidate_commission_percentage}%</p>
                        </div>
                      </div>
                    </div>
                    {config.notes && (
                      <p className="text-sm text-muted-foreground italic">{config.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(config.updated_at)}
                    </p>
                  </div>
                  <Badge variant={config.is_active ? "success" : "outline"}>
                    {config.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

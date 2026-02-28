"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types/database";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  applied: "info",
  shortlisted: "warning",
  interviewing: "warning",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "outline",
  completed: "secondary",
};

export default function ApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchApplications();
  }, [profile]);

  const fetchApplications = async () => {
    if (!profile) return;

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", profile.id)
      .single();

    if (!candidateProfile) { setLoading(false); return; }

    const { data } = await supabase
      .from("applications")
      .select("*, job:jobs(title, company:company_profiles(company_name), status, engagement_type, hourly_rate_min, hourly_rate_max, fixed_price, hours_per_week)")
      .eq("candidate_id", candidateProfile.id)
      .order("created_at", { ascending: false });

    setApplications((data as unknown as Application[]) ?? []);
    setLoading(false);
  };

  const handleWithdraw = async (appId: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", appId);

    if (!error) {
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: "withdrawn" } : a)
      );
    }
  };

  const grouped = {
    active: applications.filter((a) => ["applied", "shortlisted", "interviewing"].includes(a.status)),
    accepted: applications.filter((a) => a.status === "accepted"),
    completed: applications.filter((a) => a.status === "completed"),
    other: applications.filter((a) => ["rejected", "withdrawn"].includes(a.status)),
  };

  const ApplicationCard = ({ app }: { app: Application }) => (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <Link href={`/jobs/${app.job_id}`} className="font-semibold hover:text-primary">
              {(app as any).job?.title}
            </Link>
            <p className="text-sm text-muted-foreground">{(app as any).job?.company?.company_name}</p>
            <p className="text-xs text-muted-foreground">Applied {formatDate(app.applied_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[app.status] ?? "outline"}>{app.status}</Badge>
            {app.status === "applied" && (
              <Button size="sm" variant="outline" onClick={() => handleWithdraw(app.id)}>
                Withdraw
              </Button>
            )}
          </div>
        </div>
        {app.cover_message && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2 border-t pt-3">
            {app.cover_message}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track all your job applications</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No applications yet</p>
          <Button asChild className="mt-4"><Link href="/jobs">Browse Jobs</Link></Button>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({grouped.active.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({grouped.accepted.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({grouped.completed.length})</TabsTrigger>
            <TabsTrigger value="other">Other ({grouped.other.length})</TabsTrigger>
          </TabsList>
          {(["active", "accepted", "completed", "other"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {grouped[tab].length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No {tab} applications</p>
              ) : (
                grouped[tab].map((app) => <ApplicationCard key={app.id} app={app} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

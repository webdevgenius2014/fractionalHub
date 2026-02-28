"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Briefcase, FileText, DollarSign, MessageSquare, TrendingUp,
  PlusCircle, ArrowRight, Star
} from "lucide-react";

interface DashboardStats {
  openJobs?: number;
  totalApplications?: number;
  activeEngagements?: number;
  totalEarnings?: number;
  unreadMessages?: number;
  pendingApplications?: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentItems, setRecentItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    if (profile.user_type === "company") {
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", profile.id)
        .single();

      if (companyProfile) {
        const [{ count: openJobs }, { count: totalApplications }, { data: jobs }] = await Promise.all([
          supabase.from("jobs").select("*", { count: "exact", head: true })
            .eq("company_id", companyProfile.id).eq("status", "open"),
          supabase.from("applications").select("*, job:jobs!inner(*)", { count: "exact", head: true })
            .eq("jobs.company_id", companyProfile.id),
          supabase.from("jobs").select("*, applications(count)")
            .eq("company_id", companyProfile.id).order("created_at", { ascending: false }).limit(5),
        ]);

        setStats({ openJobs: openJobs ?? 0, totalApplications: totalApplications ?? 0 });
        setRecentItems(jobs ?? []);
      }
    } else if (profile.user_type === "candidate") {
      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("id, total_jobs_completed, rating_avg")
        .eq("user_id", profile.id)
        .single();

      if (candidateProfile) {
        const [{ count: pendingApplications }, { data: apps }] = await Promise.all([
          supabase.from("applications").select("*", { count: "exact", head: true })
            .eq("candidate_id", candidateProfile.id).eq("status", "applied"),
          supabase.from("applications").select("*, job:jobs(title, company:company_profiles(company_name))")
            .eq("candidate_id", candidateProfile.id).order("created_at", { ascending: false }).limit(5),
        ]);

        setStats({
          pendingApplications: pendingApplications ?? 0,
          activeEngagements: candidateProfile.total_jobs_completed,
        });
        setRecentItems(apps ?? []);
      }
    }

    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Button asChild className="mt-4"><Link href="/auth/login">Sign In</Link></Button>
      </div>
    );
  }

  const isCompany = profile.user_type === "company";

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.first_name}!
          </h1>
          <p className="text-muted-foreground">
            {isCompany ? "Manage your fractional executive engagements" : "Manage your fractional opportunities"}
          </p>
        </div>
        {isCompany && (
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isCompany ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Open Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.openJobs ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.totalApplications ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Active Engagements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.activeEngagements ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.unreadMessages ?? 0}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.pendingApplications ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Jobs Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : stats.activeEngagements ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency((stats.totalEarnings ?? 0) * 100)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" /> Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">—</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCompany ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/dashboard/jobs/new">
                    Post a New Job <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/candidates">
                    Browse Executives <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/dashboard/messages">
                    View Messages <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : recentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
                ) : (
                  recentItems.slice(0, 3).map((job: any) => (
                    <Link key={job.id} href={`/dashboard/jobs/${job.id}/applications`}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm">
                      <span className="font-medium truncate">{job.title}</span>
                      <Badge variant="outline">{job.status}</Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/jobs">
                    Browse Open Jobs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/dashboard/profile">
                    Update Profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/dashboard/earnings">
                    View Earnings <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : recentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                ) : (
                  recentItems.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-2 rounded-md text-sm">
                      <span className="font-medium truncate">{(app as any).job?.title}</span>
                      <Badge variant="outline">{(app as any).status}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

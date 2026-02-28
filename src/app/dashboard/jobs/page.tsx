"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Users, Edit } from "lucide-react";
import type { Job } from "@/types/database";

export default function CompanyJobsPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchJobs();
  }, [profile]);

  const fetchJobs = async () => {
    if (!profile) return;

    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", profile.id)
      .single();

    if (!companyProfile) { setLoading(false); return; }

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", companyProfile.id)
      .order("created_at", { ascending: false });

    setJobs((data as unknown as Job[]) ?? []);
    setLoading(false);
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id);

    if (!error) {
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: newStatus } : j));
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground">Manage all your job listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground text-lg">No jobs posted yet</p>
          <Button asChild>
            <Link href="/dashboard/jobs/new">Post Your First Job</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.roles_needed.map((role) => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{job.applications_count} applicant{job.applications_count !== 1 ? "s" : ""}</span>
                      <span>Posted {formatDate(job.created_at)}</span>
                      <span className="capitalize">{job.engagement_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={job.status === "open" ? "success" : "outline"}>{job.status}</Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/jobs/${job.id}/applications`}>
                        <Users className="h-3 w-3 mr-1" /> Applicants
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(job)}>
                      {job.status === "open" ? "Close" : "Reopen"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

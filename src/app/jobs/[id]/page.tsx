"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, DollarSign, Calendar, Users, Zap, ArrowLeft, CheckCircle } from "lucide-react";
import type { Job } from "@/types/database";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*, company:company_profiles(*, user:users(*))")
        .eq("id", params.id as string)
        .single();
      setJob(data as unknown as Job);
      setLoading(false);
    };
    fetchJob();
  }, [params.id]);

  const handleApply = async () => {
    if (!profile) {
      router.push("/auth/login");
      return;
    }
    setApplying(true);
    const { data: candidate } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", profile.id)
      .single();

    if (!candidate) {
      alert("Please complete your candidate profile first.");
      setApplying(false);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      job_id: job!.id,
      candidate_id: candidate.id,
      cover_message: coverMessage,
      proposed_rate: proposedRate ? parseInt(proposedRate) : undefined,
    });

    if (!error) {
      setApplyOpen(false);
      alert("Application submitted successfully!");
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1 text-center">
          <p className="text-muted-foreground">Job not found.</p>
          <Button asChild className="mt-4">
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const rateDisplay =
    job.engagement_type === "hourly"
      ? `${formatCurrency((job.hourly_rate_min ?? 0) * 100)}-${formatCurrency((job.hourly_rate_max ?? 0) * 100)}/hr`
      : job.fixed_price
      ? `${formatCurrency(job.fixed_price * 100)} fixed`
      : "Rate negotiable";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    {job.is_urgent && (
                      <Badge variant="destructive" className="gap-1">
                        <Zap className="h-3 w-3" /> Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{job.company?.company_name}</p>
                </div>
                <Badge variant={job.status === "open" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.roles_needed.map((role) => (
                  <Badge key={role} variant="secondary">{role}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" /> {rateDisplay}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {job.hours_per_week}h/week
                </span>
                {job.duration_weeks && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {job.duration_weeks} weeks
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {job.applications_count} applicants
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {job.required_skills.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Posted {formatDate(job.created_at)}
              {job.required_experience_years > 0 && ` · ${job.required_experience_years}+ years experience`}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.user_type === "candidate" ? (
                  <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={job.status !== "open"}>
                        {job.status === "open" ? "Apply for This Job" : "Position Filled"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application with a cover message.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Cover Message</Label>
                          <Textarea
                            placeholder="Tell the company why you're the right fit..."
                            value={coverMessage}
                            onChange={(e) => setCoverMessage(e.target.value)}
                            rows={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Your Proposed Rate (optional)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 150 (per hour)"
                            value={proposedRate}
                            onChange={(e) => setProposedRate(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setApplyOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleApply} disabled={applying || !coverMessage}>
                          {applying ? "Submitting..." : "Submit Application"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : profile?.user_type === "company" ? (
                  <p className="text-sm text-muted-foreground">Company accounts cannot apply to jobs.</p>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/auth/signup?type=candidate">Sign Up to Apply</Link>
                  </Button>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Verified company
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Secure payment via Stripe
                  </div>
                </div>
              </CardContent>
            </Card>

            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">About the Company</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-semibold">{job.company.company_name}</p>
                  {job.company.industry && (
                    <p className="text-muted-foreground">{job.company.industry}</p>
                  )}
                  {job.company.company_size && (
                    <p className="text-muted-foreground">{job.company.company_size} employees</p>
                  )}
                  {job.company.description && (
                    <p className="text-muted-foreground line-clamp-3">{job.company.description}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

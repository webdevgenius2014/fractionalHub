"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { PaymentBreakdown } from "@/components/payment/PaymentBreakdown";
import { formatDate, getInitials, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Star, Clock } from "lucide-react";
import type { Application, Job, CommissionConfig } from "@/types/database";

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [commission, setCommission] = useState<CommissionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingApp, setAcceptingApp] = useState<Application | null>(null);
  const [agreedRate, setAgreedRate] = useState("");
  const [agreedHours, setAgreedHours] = useState("20");
  const [accepting, setAccepting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchData();
  }, [profile, params.id]);

  const fetchData = async () => {
    const [{ data: jobData }, { data: appsData }, { data: commData }] = await Promise.all([
      supabase.from("jobs").select("*").eq("id", params.id as string).single(),
      supabase.from("applications").select(`
        *,
        candidate:candidate_profiles(
          *,
          user:users(*)
        )
      `).eq("job_id", params.id as string).order("applied_at", { ascending: false }),
      supabase.from("commission_config").select("*").eq("is_active", true).single(),
    ]);

    setJob(jobData as unknown as Job);
    setApplications((appsData as unknown as Application[]) ?? []);
    setCommission(commData as unknown as CommissionConfig);
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!acceptingApp || !commission) return;
    setAccepting(true);

    const rate = parseInt(agreedRate);
    const hours = parseInt(agreedHours);

    // Update application status
    const { error: appError } = await supabase
      .from("applications")
      .update({
        status: "accepted",
        agreed_rate: rate,
        agreed_hours_per_week: hours,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", acceptingApp.id);

    if (appError) { setAccepting(false); return; }

    // Create transaction record
    const subtotal = rate * 100; // in cents
    const companyFee = Math.round(subtotal * (commission.company_commission_percentage / 100));
    const candidateFee = Math.round(subtotal * (commission.candidate_commission_percentage / 100));

    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", profile!.id)
      .single();

    await supabase.from("transactions").insert({
      application_id: acceptingApp.id,
      company_id: companyProfile!.id,
      candidate_id: (acceptingApp as any).candidate.id,
      subtotal_amount: subtotal,
      company_commission_percentage: commission.company_commission_percentage,
      candidate_commission_percentage: commission.candidate_commission_percentage,
      company_fee_amount: companyFee,
      candidate_fee_amount: candidateFee,
      total_platform_fee_amount: companyFee + candidateFee,
      total_charge_amount: subtotal + companyFee,
      candidate_payout_amount: subtotal - candidateFee,
      status: "pending_charge",
    });

    // Update job
    await supabase
      .from("jobs")
      .update({ accepted_candidate_id: (acceptingApp as any).candidate.id })
      .eq("id", params.id as string);

    setAcceptingApp(null);
    setAccepting(false);
    await fetchData();
  };

  const handleReject = async (appId: string) => {
    await supabase
      .from("applications")
      .update({ status: "rejected", rejected_at: new Date().toISOString() })
      .eq("id", appId);
    await fetchData();
  };

  const statusColors: Record<string, string> = {
    applied: "info", shortlisted: "warning", interviewing: "warning",
    accepted: "success", rejected: "destructive", withdrawn: "outline", completed: "secondary",
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <Button variant="ghost" asChild className="-ml-2 mb-2">
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{job?.title ?? "Loading..."}</h1>
        <p className="text-muted-foreground">{applications.length} application{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-sm">Applications will appear here as candidates apply.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const candidate = (app as any).candidate;
            const user = candidate?.user;
            return (
              <Card key={app.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4 flex-wrap">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={user?.profile_photo_url} />
                      <AvatarFallback>
                        {user ? getInitials(user.first_name, user.last_name) : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <Link href={`/candidates/${candidate?.id}`}
                            className="font-semibold hover:text-primary">
                            {user?.first_name} {user?.last_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{candidate?.headline}</p>
                        </div>
                        <Badge variant={(statusColors[app.status] as any) ?? "outline"}>{app.status}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {candidate?.rating_avg > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {candidate.rating_avg.toFixed(1)} ({candidate.total_reviews})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {candidate?.availability_hours_per_week}h/week available
                        </span>
                        {app.proposed_rate && (
                          <span>Proposed: {formatCurrency(app.proposed_rate * 100)}/hr</span>
                        )}
                        <span>Applied {formatDate(app.applied_at)}</span>
                      </div>

                      {app.cover_message && (
                        <p className="text-sm text-muted-foreground border-t pt-2 line-clamp-3">
                          {app.cover_message}
                        </p>
                      )}

                      {app.status === "applied" && (
                        <div className="flex gap-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => {
                                setAcceptingApp(app);
                                setAgreedRate(app.proposed_rate?.toString() ?? "");
                              }}>
                                Accept Candidate
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Accept {user?.first_name}?</DialogTitle>
                                <DialogDescription>
                                  Set the agreed terms and confirm the engagement.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Agreed Rate ($/hr)</Label>
                                    <Input
                                      type="number"
                                      value={agreedRate}
                                      onChange={(e) => setAgreedRate(e.target.value)}
                                      placeholder="150"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Hours/Week</Label>
                                    <Input
                                      type="number"
                                      value={agreedHours}
                                      onChange={(e) => setAgreedHours(e.target.value)}
                                      placeholder="20"
                                    />
                                  </div>
                                </div>
                                {agreedRate && commission && (
                                  <PaymentBreakdown
                                    subtotalCents={parseInt(agreedRate) * 100}
                                    companyPct={commission.company_commission_percentage}
                                    candidatePct={commission.candidate_commission_percentage}
                                    showForCompany={true}
                                  />
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setAcceptingApp(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleAccept}
                                  disabled={accepting || !agreedRate}
                                >
                                  {accepting ? "Accepting..." : "Confirm & Accept"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={() => handleReject(app.id)}>
                            Decline
                          </Button>
                        </div>
                      )}
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

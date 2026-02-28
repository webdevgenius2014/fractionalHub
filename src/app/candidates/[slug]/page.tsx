"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  Star, Clock, Briefcase, CheckCircle, Globe, Linkedin, Github,
  ArrowLeft, MessageSquare, ExternalLink
} from "lucide-react";
import type { CandidateProfile, Review } from "@/types/database";

export default function CandidateProfilePage() {
  const params = useParams();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data: cData } = await supabase
        .from("candidate_profiles")
        .select("*, user:users(*)")
        .eq("id", params.slug as string)
        .single();
      setCandidate(cData as unknown as CandidateProfile);

      if (cData) {
        const { data: rData } = await supabase
          .from("reviews")
          .select("*, reviewer:users!reviews_reviewer_id_fkey(*)")
          .eq("reviewed_user_id", (cData as unknown as CandidateProfile).user_id)
          .order("created_at", { ascending: false });
        setReviews((rData as unknown as Review[]) ?? []);
      }
      setLoading(false);
    };
    fetchCandidate();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1 text-center">
          <p className="text-muted-foreground">Executive not found.</p>
          <Button asChild className="mt-4"><Link href="/candidates">Browse Executives</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const rateDisplay = candidate.hourly_rate_min && candidate.hourly_rate_max
    ? `${formatCurrency(candidate.hourly_rate_min * 100)}-${formatCurrency(candidate.hourly_rate_max * 100)}/hr`
    : "Rate on request";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8 flex-1">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link href="/candidates">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Executives
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={candidate.user?.profile_photo_url} />
                <AvatarFallback className="text-2xl">
                  {candidate.user ? getInitials(candidate.user.first_name, candidate.user.last_name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">
                    {candidate.user?.first_name} {candidate.user?.last_name}
                  </h1>
                  {candidate.is_verified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                {candidate.headline && (
                  <p className="text-muted-foreground">{candidate.headline}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {candidate.roles.map((role) => (
                    <Badge key={role} variant="secondary">{role}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {candidate.rating_avg > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {candidate.rating_avg.toFixed(1)} ({candidate.total_reviews} reviews)
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {candidate.total_jobs_completed} jobs completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {candidate.availability_hours_per_week}h/week available
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {candidate.bio && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">About</h2>
                <p className="text-muted-foreground whitespace-pre-line">{candidate.bio}</p>
              </div>
            )}

            {candidate.expertise_areas.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.expertise_areas.map((area) => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.skills.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="text-sm bg-muted px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hire {candidate.user?.first_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-primary">{rateDisplay}</p>
                  <Badge
                    variant={
                      candidate.availability_status === "available"
                        ? "success"
                        : candidate.availability_status === "limited"
                        ? "warning"
                        : "destructive"
                    }
                    className="mt-2"
                  >
                    {candidate.availability_status}
                  </Badge>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/jobs/new">Post a Job</Link>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/dashboard/messages">
                    <MessageSquare className="h-4 w-4" /> Send Message
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Links</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {candidate.linkedin_url && (
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.github_url && (
                  <a href={candidate.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Github className="h-4 w-4" /> GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.portfolio_url && (
                  <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" /> Portfolio
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!candidate.linkedin_url && !candidate.github_url && !candidate.portfolio_url && (
                  <p className="text-sm text-muted-foreground">No links provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

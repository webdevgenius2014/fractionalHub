import Link from "next/link";
import { Clock, MapPin, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Job } from "@/types/database";

interface JobCardProps {
  job: Job;
  showApply?: boolean;
}

export function JobCard({ job, showApply = true }: JobCardProps) {
  const rateDisplay = job.engagement_type === "hourly"
    ? `${formatCurrency((job.hourly_rate_min ?? 0) * 100)}-${formatCurrency((job.hourly_rate_max ?? 0) * 100)}/hr`
    : job.fixed_price
    ? `${formatCurrency(job.fixed_price * 100)} fixed`
    : "Rate negotiable";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-primary">
                {job.title}
              </Link>
              {job.is_urgent && (
                <Badge variant="destructive" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {job.company?.company_name ?? "Company"}
            </p>
          </div>
          <Badge variant="outline">{job.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {job.roles_needed.map((role) => (
            <Badge key={role} variant="secondary">{role}</Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            {rateDisplay}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {job.hours_per_week}h/week
          </span>
          {job.duration_weeks && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.duration_weeks} weeks
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {job.applications_count} applicant{job.applications_count !== 1 ? "s" : ""} &bull; Posted {formatDate(job.created_at)}
          </span>
          {showApply && (
            <Button size="sm" asChild>
              <Link href={`/jobs/${job.id}`}>View Job</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { Star, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import type { CandidateProfile } from "@/types/database";

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const availabilityConfig = {
  available: { label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  limited: { label: "Limited", className: "bg-amber-50 text-amber-700 border-amber-200" },
  unavailable: { label: "Unavailable", className: "bg-red-50 text-red-600 border-red-200" },
} as const;

export function CandidateCard({ candidate }: CandidateCardProps) {
  const slug = candidate.id;
  const rateDisplay =
    candidate.hourly_rate_min && candidate.hourly_rate_max
      ? `${formatCurrency(candidate.hourly_rate_min * 100)}–${formatCurrency(candidate.hourly_rate_max * 100)}/hr`
      : candidate.hourly_rate_min
      ? `From ${formatCurrency(candidate.hourly_rate_min * 100)}/hr`
      : "Rate on request";

  const avail = availabilityConfig[candidate.availability_status] ?? availabilityConfig.unavailable;
  const isTopRated = candidate.rating_avg >= 4.8 && candidate.total_reviews >= 3;

  return (
    <div className="group relative border border-border rounded-xl bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {isTopRated && (
        <div className="absolute -top-px left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-border">
            <AvatarImage src={candidate.user?.profile_photo_url} />
            <AvatarFallback className="bg-navy text-white font-semibold text-sm">
              {candidate.user
                ? getInitials(candidate.user.first_name, candidate.user.last_name)
                : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/candidates/${slug}`}
                className="font-semibold hover:text-primary transition-colors truncate"
              >
                {candidate.user?.first_name} {candidate.user?.last_name}
              </Link>
              {candidate.is_verified && (
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              {isTopRated && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> Top Rated
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {candidate.headline ?? "Fractional Executive"}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border",
              avail.className
            )}
          >
            {avail.label}
          </span>
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {candidate.roles.slice(0, 4).map((role) => (
            <span
              key={role}
              className="text-xs font-medium bg-secondary text-secondary-foreground rounded-md px-2 py-0.5"
            >
              {role}
            </span>
          ))}
          {candidate.roles.length > 4 && (
            <span className="text-xs text-muted-foreground px-1 py-0.5">
              +{candidate.roles.length - 4}
            </span>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{candidate.bio}</p>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-[11px] bg-muted text-muted-foreground rounded-full px-2 py-0.5"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="text-[11px] text-muted-foreground px-1 py-0.5">
                +{candidate.skills.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {candidate.rating_avg > 0
                ? `${candidate.rating_avg.toFixed(1)} (${candidate.total_reviews})`
                : "No reviews"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {candidate.availability_hours_per_week}h/wk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">{rateDisplay}</span>
            <Button size="sm" asChild className="h-7 text-xs px-3">
              <Link href={`/candidates/${slug}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

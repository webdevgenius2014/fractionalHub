import Link from "next/link";
import { Star, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { CandidateProfile } from "@/types/database";

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const availabilityColors = {
  available: "success",
  limited: "warning",
  unavailable: "destructive",
} as const;

export function CandidateCard({ candidate }: CandidateCardProps) {
  const slug = candidate.id;
  const rateDisplay = candidate.hourly_rate_min && candidate.hourly_rate_max
    ? `${formatCurrency(candidate.hourly_rate_min * 100)}-${formatCurrency(candidate.hourly_rate_max * 100)}/hr`
    : "Rate on request";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={candidate.user?.profile_photo_url} />
            <AvatarFallback>
              {candidate.user ? getInitials(candidate.user.first_name, candidate.user.last_name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/candidates/${slug}`} className="font-semibold hover:text-primary">
                {candidate.user?.first_name} {candidate.user?.last_name}
              </Link>
              {candidate.is_verified && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{candidate.headline}</p>
          </div>
          <Badge variant={availabilityColors[candidate.availability_status]}>
            {candidate.availability_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {candidate.roles.slice(0, 3).map((role) => (
            <Badge key={role} variant="secondary">{role}</Badge>
          ))}
        </div>

        {candidate.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-500" />
            {candidate.rating_avg > 0 ? `${candidate.rating_avg.toFixed(1)} (${candidate.total_reviews})` : "No reviews yet"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {candidate.availability_hours_per_week}h/week available
          </span>
        </div>

        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{candidate.skills.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{rateDisplay}</span>
          <Button size="sm" asChild>
            <Link href={`/candidates/${slug}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

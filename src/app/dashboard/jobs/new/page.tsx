"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { ROLE_OPTIONS } from "@/lib/utils";
import { ArrowLeft, Plus, X } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  engagement_type: z.enum(["hourly", "fixed", "milestone"]),
  hourly_rate_min: z.number().min(0).optional(),
  hourly_rate_max: z.number().min(0).optional(),
  fixed_price: z.number().min(0).optional(),
  duration_weeks: z.number().min(1).optional(),
  hours_per_week: z.number().min(1).max(40),
  required_experience_years: z.number().min(0),
  is_urgent: z.boolean(),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [rolesNeeded, setRolesNeeded] = useState<string[]>(["CTO"]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      engagement_type: "hourly",
      hours_per_week: 20,
      required_experience_years: 5,
      is_urgent: false,
    },
  });

  const engagementType = watch("engagement_type");

  const toggleRole = (role: string) => {
    setRolesNeeded((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const onSubmit = async (data: JobForm) => {
    if (rolesNeeded.length === 0) {
      setError("Please select at least one role.");
      return;
    }
    setLoading(true);
    setError("");

    const { data: companyProfile } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", profile!.id)
      .single();

    if (!companyProfile) {
      setError("Company profile not found. Please set up your profile first.");
      setLoading(false);
      return;
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        company_id: companyProfile.id,
        title: data.title,
        description: data.description,
        roles_needed: rolesNeeded,
        required_skills: skills,
        engagement_type: data.engagement_type,
        hourly_rate_min: data.hourly_rate_min,
        hourly_rate_max: data.hourly_rate_max,
        fixed_price: data.fixed_price,
        duration_weeks: data.duration_weeks,
        hours_per_week: data.hours_per_week,
        required_experience_years: data.required_experience_years,
        is_urgent: data.is_urgent,
        status: "open",
      })
      .select()
      .single();

    if (jobError) {
      setError(jobError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/jobs/${job.id}/applications`);
  };

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="-ml-2 mb-2">
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground">Describe the fractional role you need</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>
        )}

        <Card>
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input placeholder="Fractional CTO for Series A startup" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the role, responsibilities, what you're looking for, and why it's exciting..."
                rows={8}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Roles Needed</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => (
                <Badge
                  key={role}
                  variant={rolesNeeded.includes(role) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleRole(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Engagement Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Engagement Type *</Label>
              <Select value={engagementType} onValueChange={(v) => setValue("engagement_type", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="milestone">Milestone-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {engagementType === "hourly" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Rate ($/hr)</Label>
                  <Input type="number" placeholder="100" {...register("hourly_rate_min", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Rate ($/hr)</Label>
                  <Input type="number" placeholder="200" {...register("hourly_rate_max", { valueAsNumber: true })} />
                </div>
              </div>
            )}

            {(engagementType === "fixed" || engagementType === "milestone") && (
              <div className="space-y-2">
                <Label>Fixed Price ($)</Label>
                <Input type="number" placeholder="5000" {...register("fixed_price", { valueAsNumber: true })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours Per Week</Label>
                <Input type="number" min={1} max={40} {...register("hours_per_week", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input type="number" min={1} placeholder="12" {...register("duration_weeks", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Experience (years)</Label>
              <Input type="number" min={0} {...register("required_experience_years", { valueAsNumber: true })} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_urgent" {...register("is_urgent")} className="h-4 w-4" />
              <Label htmlFor="is_urgent">Mark as Urgent</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a required skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 bg-muted text-sm px-3 py-1 rounded-full">
                  {skill}
                  <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Job"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/jobs")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

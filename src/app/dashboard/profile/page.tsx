"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { ROLE_OPTIONS } from "@/lib/utils";
import { X, Plus, CheckCircle } from "lucide-react";

const candidateSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate_min: z.number().min(0).optional(),
  hourly_rate_max: z.number().min(0).optional(),
  years_experience: z.number().min(0).optional(),
  availability_hours_per_week: z.number().min(1).max(40),
  availability_status: z.enum(["available", "unavailable", "limited"]),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
});

const companySchema = z.object({
  company_name: z.string().min(2),
  company_website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export default function ProfilePage() {
  const { profile } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const supabase = createClient();

  const candidateForm = useForm({ resolver: zodResolver(candidateSchema) });
  const companyForm = useForm({ resolver: zodResolver(companySchema) });

  useEffect(() => {
    if (profile) fetchProfile();
  }, [profile]);

  const fetchProfile = async () => {
    if (!profile) return;

    if (profile.user_type === "candidate") {
      const { data } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (data) {
        setCandidateProfile(data);
        setSkills(data.skills ?? []);
        setRoles(data.roles ?? []);
        candidateForm.reset({
          headline: data.headline ?? "",
          bio: data.bio ?? "",
          hourly_rate_min: data.hourly_rate_min,
          hourly_rate_max: data.hourly_rate_max,
          years_experience: data.years_experience,
          availability_hours_per_week: data.availability_hours_per_week,
          availability_status: data.availability_status,
          portfolio_url: data.portfolio_url ?? "",
          linkedin_url: data.linkedin_url ?? "",
          github_url: data.github_url ?? "",
        });
      }
    } else if (profile.user_type === "company") {
      const { data } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (data) {
        setCompanyProfile(data);
        companyForm.reset({
          company_name: data.company_name,
          company_website: data.company_website ?? "",
          industry: data.industry ?? "",
          location: data.location ?? "",
          description: data.description ?? "",
        });
      }
    }

    setLoading(false);
  };

  const onSaveCandidate = async (data: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("candidate_profiles")
      .update({ ...data, skills, roles, updated_at: new Date().toISOString() })
      .eq("user_id", profile!.id);

    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  const onSaveCompany = async (data: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("company_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", profile!.id);

    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const toggleRole = (role: string) => {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  if (loading) {
    return <div className="p-8"><div className="h-64 bg-muted rounded animate-pulse" /></div>;
  }

  if (profile?.user_type === "candidate") {
    return (
      <div className="p-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your executive profile</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" /> Saved!
            </div>
          )}
        </div>

        <form onSubmit={candidateForm.handleSubmit(onSaveCandidate)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Professional Headline</Label>
                <Input placeholder="Fractional CTO | 15+ years scaling SaaS" {...candidateForm.register("headline")} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea placeholder="Tell companies about your experience..." rows={5}
                  {...candidateForm.register("bio")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <Badge
                    key={role}
                    variant={roles.includes(role) ? "default" : "outline"}
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
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
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

          <Card>
            <CardHeader><CardTitle>Rates & Availability</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Hourly Rate ($)</Label>
                  <Input type="number" placeholder="100" {...candidateForm.register("hourly_rate_min", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Hourly Rate ($)</Label>
                  <Input type="number" placeholder="200" {...candidateForm.register("hourly_rate_max", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hours Available Per Week</Label>
                  <Input type="number" min={1} max={40} {...candidateForm.register("availability_hours_per_week", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Availability Status</Label>
                  <Select
                    value={candidateForm.watch("availability_status")}
                    onValueChange={(v) => candidateForm.setValue("availability_status", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input placeholder="https://linkedin.com/in/..." {...candidateForm.register("linkedin_url")} />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input placeholder="https://github.com/..." {...candidateForm.register("github_url")} />
              </div>
              <div className="space-y-2">
                <Label>Portfolio URL</Label>
                <Input placeholder="https://your-website.com" {...candidateForm.register("portfolio_url")} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    );
  }

  // Company Profile
  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Update your company information</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" /> Saved!
          </div>
        )}
      </div>

      <form onSubmit={companyForm.handleSubmit(onSaveCompany)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="Acme Inc." {...companyForm.register("company_name")} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input placeholder="https://acme.com" {...companyForm.register("company_website")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input placeholder="Technology" {...companyForm.register("industry")} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="San Francisco, CA" {...companyForm.register("location")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Tell executives about your company..." rows={5}
                {...companyForm.register("description")} />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}

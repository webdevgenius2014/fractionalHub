"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";
import type { CandidateProfile } from "@/types/database";
import { ROLE_OPTIONS } from "@/lib/utils";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [availability, setAvailability] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchCandidates();
  }, [selectedRole, availability]);

  const fetchCandidates = async () => {
    setLoading(true);
    let query = supabase
      .from("candidate_profiles")
      .select("*, user:users(*)")
      .order("rating_avg", { ascending: false });

    if (selectedRole !== "all") {
      query = query.contains("roles", [selectedRole]);
    }
    if (availability !== "all") {
      query = query.eq("availability_status", availability);
    }

    const { data } = await query;
    setCandidates((data as unknown as CandidateProfile[]) ?? []);
    setLoading(false);
  };

  const filtered = candidates.filter((c) =>
    search === "" ||
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.headline ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.bio ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-muted/30 border-b py-12">
        <div className="container space-y-4">
          <h1 className="text-3xl font-bold">Find Fractional Executives</h1>
          <p className="text-muted-foreground">
            Browse verified C-suite leaders available for fractional engagements.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, headline, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full md:w-64 space-y-4 shrink-0">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Browse by Role</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <Badge
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRole(selectedRole === role ? "all" : role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>

          {/* Candidates Grid */}
          <div className="flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length} executives found`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No executives found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

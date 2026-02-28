"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CandidateProfile } from "@/types/database";
import { ROLE_OPTIONS, INDUSTRY_OPTIONS, COMPANY_STAGE_OPTIONS, cn } from "@/lib/utils";

function CheckboxPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "bg-primary border-primary"
            : "border-border group-hover:border-primary/60"
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </div>
      <span className={cn("text-sm", checked ? "text-foreground font-medium" : "text-muted-foreground")}>
        {label}
      </span>
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState<number>(500);
  const [availability, setAvailability] = useState<string>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("candidate_profiles")
        .select("*, user:users(*)")
        .order("rating_avg", { ascending: false });
      setCandidates((data as unknown as CandidateProfile[]) ?? []);
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const filtered = candidates.filter((c) => {
    if (
      search !== "" &&
      !`${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(search.toLowerCase()) &&
      !(c.headline ?? "").toLowerCase().includes(search.toLowerCase()) &&
      !(c.bio ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (selectedRoles.length > 0 && !selectedRoles.some((r) => c.roles.includes(r))) return false;
    if (
      selectedStages.length > 0 &&
      !selectedStages.some((s) => c.expertise_areas?.includes(s))
    )
      return false;
    if (
      selectedIndustries.length > 0 &&
      !selectedIndustries.some(
        (i) => c.expertise_areas?.includes(i) || c.skills?.includes(i)
      )
    )
      return false;
    if (c.hourly_rate_min != null && c.hourly_rate_min > maxRate) return false;
    if (availability !== "all" && c.availability_status !== availability) return false;
    return true;
  });

  const activeFilterCount =
    selectedRoles.length +
    selectedStages.length +
    selectedIndustries.length +
    (maxRate < 500 ? 1 : 0) +
    (availability !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSelectedRoles([]);
    setSelectedStages([]);
    setSelectedIndustries([]);
    setMaxRate(500);
    setAvailability("all");
  };

  const Sidebar = () => (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Filters</span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="flex flex-wrap gap-2">
          {[
            { val: "all", label: "Any" },
            { val: "available", label: "Available" },
            { val: "limited", label: "Limited" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setAvailability(val)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                availability === val
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Role */}
      <FilterSection title="Role">
        <div className="space-y-2.5">
          {ROLE_OPTIONS.map((role) => (
            <CheckboxPill
              key={role}
              label={role}
              checked={selectedRoles.includes(role)}
              onChange={() => setSelectedRoles((prev) => toggleItem(prev, role))}
            />
          ))}
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Company Stage */}
      <FilterSection title="Company Stage">
        <div className="space-y-2.5">
          {COMPANY_STAGE_OPTIONS.map((stage) => (
            <CheckboxPill
              key={stage}
              label={stage}
              checked={selectedStages.includes(stage)}
              onChange={() => setSelectedStages((prev) => toggleItem(prev, stage))}
            />
          ))}
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Industry */}
      <FilterSection title="Industry">
        <div className="space-y-2.5">
          {INDUSTRY_OPTIONS.slice(0, 8).map((industry) => (
            <CheckboxPill
              key={industry}
              label={industry}
              checked={selectedIndustries.includes(industry)}
              onChange={() =>
                setSelectedIndustries((prev) => toggleItem(prev, industry))
              }
            />
          ))}
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Hourly Rate */}
      <FilterSection title="Max Hourly Rate">
        <div className="space-y-3">
          <input
            type="range"
            min={50}
            max={500}
            step={25}
            value={maxRate}
            onChange={(e) => setMaxRate(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$50/hr</span>
            <span className="font-semibold text-foreground">
              {maxRate === 500 ? "Any" : `Up to $${maxRate}/hr`}
            </span>
            <span>$500/hr</span>
          </div>
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy text-white py-14">
        <div className="container space-y-4">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest">
            Fractional Executive Network
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Find Your Fractional Executive
          </h1>
          <p className="text-white/70 max-w-xl">
            Browse verified C-suite leaders available for fractional engagements.
            Filter by role, industry, stage, and rate.
          </p>
          <div className="relative max-w-xl pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search by name, headline, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${filtered.length} executives found`}
          </p>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 text-sm font-medium border rounded-lg px-3 py-1.5 hover:bg-muted"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filters */}
        {mobileFiltersOpen && (
          <div className="md:hidden mb-6 p-4 border rounded-xl bg-card shadow-sm">
            <Sidebar />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 p-4 border rounded-xl bg-card shadow-sm">
              <Sidebar />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 space-y-4">
            <div className="hidden md:flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${filtered.length} executives found`}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {r}
                    <button onClick={() => setSelectedRoles((p) => p.filter((x) => x !== r))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedStages.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {s}
                    <button onClick={() => setSelectedStages((p) => p.filter((x) => x !== s))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedIndustries.map((i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {i}
                    <button onClick={() => setSelectedIndustries((p) => p.filter((x) => x !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {maxRate < 500 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                    Up to ${maxRate}/hr
                    <button onClick={() => setMaxRate(500)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-semibold">No executives found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

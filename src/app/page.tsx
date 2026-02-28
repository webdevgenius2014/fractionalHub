import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle, ArrowRight, Star, Briefcase, Users, TrendingUp,
  Shield, Zap, DollarSign
} from "lucide-react";

const stats = [
  { label: "Verified Executives", value: "500+" },
  { label: "Companies Served", value: "200+" },
  { label: "Jobs Completed", value: "1,000+" },
  { label: "Average Rating", value: "4.9★" },
];

const roles = ["CTO", "CMO", "CPO", "CFO", "COO", "CHRO", "CRO"];

const features = [
  {
    icon: Shield,
    title: "Verified Executives",
    description: "Every executive is vetted for experience, credentials, and expertise before joining.",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    description: "Get matched with qualified fractional leaders within 48 hours of posting.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Clear 5% + 5% split commission. No hidden fees, no surprises.",
  },
  {
    icon: TrendingUp,
    title: "Real Results",
    description: "Fractional executives deliver strategic leadership without the full-time cost.",
  },
];

const howItWorksCompany = [
  { step: "1", title: "Post Your Job", desc: "Describe the role, hours, and budget." },
  { step: "2", title: "Review Applicants", desc: "Get matched with qualified executives." },
  { step: "3", title: "Accept & Pay", desc: "Accept the best fit and pay securely." },
  { step: "4", title: "Start Working", desc: "Your fractional executive starts immediately." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-background py-20 md:py-32">
        <div className="container text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            The #1 Marketplace for Fractional Executives
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Strategic Leadership,{" "}
            <span className="text-primary">Flexible Terms</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with world-class fractional CTOs, CMOs, CFOs, COOs, and more.
            Scale your leadership without the full-time commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/jobs">
                Browse Opportunities <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/candidates">Find an Executive</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {roles.map((role) => (
              <Badge key={role} variant="outline" className="text-sm">
                Fractional {role}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Why FractionalHub?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The trusted platform for fractional executive engagements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">For companies hiring fractional executives</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorksCompany.map((step) => (
              <div key={step.step} className="text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">
              We charge a 5% fee to companies and a 5% fee to executives. That&apos;s it.
            </p>
            <div className="rounded-xl border bg-muted/30 p-6 space-y-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Agreed Rate</span>
                <span className="font-bold">$5,000</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Company Platform Fee (5%)</span>
                <span>+$250</span>
              </div>
              <hr />
              <div className="flex items-center justify-between font-semibold">
                <span>Company pays total</span>
                <span className="text-primary">$5,250</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Executive receives</span>
                <span className="text-green-600">$4,750</span>
              </div>
            </div>
            <Button asChild>
              <Link href="/pricing">See Full Pricing Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Whether you&apos;re looking for strategic leadership or want to offer your expertise fractionally,
            FractionalHub connects you with the right opportunities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup?type=company">Hire an Executive</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/auth/signup?type=candidate">Join as Executive</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

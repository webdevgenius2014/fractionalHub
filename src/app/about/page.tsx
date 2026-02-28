import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Heart, Shield, Zap } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description: "We focus on outcomes. Every engagement is designed to deliver real strategic impact for companies.",
  },
  {
    icon: Heart,
    title: "Executive-First",
    description: "We genuinely care about our executive community. Fair pay, transparent fees, and strong support.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "No hidden fees, verified profiles, and secure payments. Everything you see is what you get.",
  },
  {
    icon: Zap,
    title: "Move Fast",
    description: "Companies need leadership now. Our platform connects you with executives in days, not months.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-muted/30 border-b py-20">
        <div className="container text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="secondary">About FractionalHub</Badge>
          <h1 className="text-4xl font-bold">
            The Future of Executive Leadership is Fractional
          </h1>
          <p className="text-lg text-muted-foreground">
            FractionalHub was built to solve a real problem: great companies need strategic
            leadership, and experienced executives want flexible work. We bridge that gap.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe every company — from seed-stage startups to scaling enterprises —
            deserves access to world-class strategic leadership. And we believe experienced
            executives should have the freedom to build a portfolio of meaningful engagements
            rather than be locked into one role.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            FractionalHub is the marketplace that makes both possible. With transparent
            pricing, verified profiles, and secure payments, we&apos;ve removed the friction
            from fractional executive engagements.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Our Values</h2>
            <p className="text-muted-foreground">What guides everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container max-w-4xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">How FractionalHub Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">For Companies</h3>
              <ol className="space-y-3">
                {[
                  "Create your company profile and add payment details",
                  "Post a job describing the role, budget, and hours needed",
                  "Review applications from verified fractional executives",
                  "Accept the best fit — payment is charged upfront via Stripe",
                  "Work together and submit a review when complete",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">For Executives</h3>
              <ol className="space-y-3">
                {[
                  "Create your executive profile with experience and rates",
                  "Set up your Stripe Connect account to receive payouts",
                  "Browse and apply to relevant fractional opportunities",
                  "Get accepted and start delivering strategic value",
                  "Complete the engagement and get paid automatically",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup?type=company">I need an executive</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/auth/signup?type=candidate">I am an executive</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

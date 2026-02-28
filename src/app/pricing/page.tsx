import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";

const companyFeatures = [
  "Post unlimited job listings",
  "Access to 500+ verified executives",
  "Secure payment processing via Stripe",
  "Real-time messaging with candidates",
  "Application management dashboard",
  "Performance reviews after completion",
];

const candidateFeatures = [
  "Create a professional profile",
  "Apply to unlimited opportunities",
  "Secure payout via Stripe Connect",
  "Portfolio and ratings showcase",
  "Real-time messaging with companies",
  "Track all earnings and payouts",
];

const examples = [
  { agreed: 5000, company: 250, candidate: 250, charge: 5250, payout: 4750 },
  { agreed: 10000, company: 500, candidate: 500, charge: 10500, payout: 9500 },
  { agreed: 25000, company: 1250, candidate: 1250, charge: 26250, payout: 23750 },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-16 flex-1 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary">Simple Pricing</Badge>
          <h1 className="text-4xl font-bold">Transparent, Fair Commission</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe in transparent pricing. Our split commission model means both parties
            contribute equally to the platform that connects them.
          </p>
        </div>

        {/* Main Commission */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  For Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <span className="text-5xl font-bold text-primary">5%</span>
                  <p className="text-muted-foreground mt-1">platform fee on top of agreed rate</p>
                </div>
                <Separator />
                <ul className="space-y-2">
                  {companyFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth/signup?type=company">Hire an Executive</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  For Executives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <span className="text-5xl font-bold text-green-600">5%</span>
                  <p className="text-muted-foreground mt-1">deducted from your agreed rate</p>
                </div>
                <Separator />
                <ul className="space-y-2">
                  {candidateFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/signup?type=candidate">Join as Executive</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Examples */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Commission Examples</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Agreed Rate</th>
                  <th className="text-right p-4 font-medium">Company Pays</th>
                  <th className="text-right p-4 font-medium">Executive Receives</th>
                  <th className="text-right p-4 font-medium">Platform Fee</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((ex) => (
                  <tr key={ex.agreed} className="border-t">
                    <td className="p-4 font-semibold">${ex.agreed.toLocaleString()}</td>
                    <td className="p-4 text-right text-primary font-medium">
                      ${ex.charge.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-green-600 font-medium">
                      ${ex.payout.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      ${(ex.company + ex.candidate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Rates are applied as: Company pays agreed rate + 5%. Executive receives agreed rate - 5%.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "When are payments charged?",
                a: "Payments are charged upfront when a company accepts a candidate. This ensures both parties are committed to the engagement.",
              },
              {
                q: "How do executive payouts work?",
                a: "Executives receive their payout via Stripe Connect after completing the work and receiving company approval (within 7 days of completion).",
              },
              {
                q: "Can commission rates change?",
                a: "Our admin team can adjust commission rates. Any changes apply to new engagements only — existing ones keep the rate that was in effect when they were created.",
              },
              {
                q: "Are there any other fees?",
                a: "No. The 5% + 5% split is the only commission we charge. Standard Stripe processing fees may apply to payments.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="pt-4 space-y-2">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

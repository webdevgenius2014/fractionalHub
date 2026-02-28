import { formatCurrency, calculateCommission } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PaymentBreakdownProps {
  subtotalCents: number;
  companyPct: number;
  candidatePct: number;
  showForCompany?: boolean;
}

export function PaymentBreakdown({
  subtotalCents,
  companyPct,
  candidatePct,
  showForCompany = true,
}: PaymentBreakdownProps) {
  const {
    subtotal,
    companyFee,
    candidateFee,
    totalCharge,
    candidatePayout,
    platformRevenue,
  } = calculateCommission(subtotalCents, companyPct, candidatePct);

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
      <h4 className="font-semibold">Payment Breakdown</h4>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Agreed Rate</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {showForCompany && (
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Fee ({companyPct}%)</span>
            <span>+{formatCurrency(companyFee)}</span>
          </div>
        )}

        <Separator />

        {showForCompany ? (
          <div className="flex justify-between font-semibold text-base">
            <span>You will be charged</span>
            <span className="text-primary">{formatCurrency(totalCharge)}</span>
          </div>
        ) : (
          <div className="flex justify-between font-semibold text-base">
            <span>You will receive</span>
            <span className="text-green-600">{formatCurrency(candidatePayout)}</span>
          </div>
        )}
      </div>

      <div className="rounded-md bg-muted p-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Agreed Rate</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Company fee ({companyPct}%)</span>
          <span>{formatCurrency(companyFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Candidate fee ({candidatePct}%)</span>
          <span>{formatCurrency(candidateFee)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between font-medium text-foreground">
          <span>Total charged to company</span>
          <span>{formatCurrency(totalCharge)}</span>
        </div>
        <div className="flex justify-between font-medium text-foreground">
          <span>Candidate receives</span>
          <span>{formatCurrency(candidatePayout)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform revenue</span>
          <span>{formatCurrency(platformRevenue)}</span>
        </div>
      </div>
    </div>
  );
}

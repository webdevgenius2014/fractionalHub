import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">FH</span>
              </div>
              <span className="font-bold text-lg">FractionalHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting fractional C-suite executives with companies that need strategic leadership.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">For Companies</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/candidates" className="hover:text-foreground">Browse Executives</Link></li>
              <li><Link href="/dashboard/jobs/new" className="hover:text-foreground">Post a Job</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-foreground">How It Works</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">For Executives</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-foreground">Browse Jobs</Link></li>
              <li><Link href="/auth/signup" className="hover:text-foreground">Join as Executive</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Commission Rates</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-foreground">Your Profile</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FractionalHub. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for fractional leaders everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}

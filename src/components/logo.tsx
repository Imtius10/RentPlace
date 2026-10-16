import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  /** renders compact mark only (for narrow sidebars) */
  markOnly?: boolean;
}

export function Logo({ className, href = "/", markOnly = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="RentPlace home"
    >
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-emerald-600/25 transition-transform duration-300 group-hover:-rotate-6">
        <Home className="size-4.5" strokeWidth={2.4} />
      </span>
      {!markOnly && (
        <span className="text-lg font-semibold tracking-tight">
          Rent<span className="text-gradient">Nest</span>
        </span>
      )}
    </Link>
  );
}

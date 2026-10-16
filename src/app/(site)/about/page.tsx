import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Eye, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "How RentPlace connects tenants, landlords and admins.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    text: "Every landlord is verified and every listing is moderated by our admin team before it stays live.",
  },
  {
    icon: Zap,
    title: "Fast decisions",
    text: "Requests, approvals and payments happen inside one dashboard — no phone tag, no paperwork chase.",
  },
  {
    icon: Eye,
    title: "Full transparency",
    text: "Tenants see request status live, landlords see their pipeline, admins see platform health.",
  },
  {
    icon: Building2,
    title: "Made for real estates",
    text: "From studio flats to villas, categories and filters are tuned for how people actually rent.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-primary">About RentPlace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Rental housing, minus the friction
        </h1>
        <p className="mt-4 text-muted-foreground">
          RentPlace is a full-stack rental marketplace with three working roles.
          Tenants discover and request homes, landlords run their listings and
          approvals, and admins keep the whole platform honest.
        </p>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <div
            key={value.title}
            className="rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <value.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {value.text}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14 overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              One platform, three experiences
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The interface adapts to the signed-in role: tenants get a request
              and payment center, landlords get listing management with
              approve/reject controls, and admins get user moderation and global
              statistics. Route protection is enforced by Next.js middleware, and
              every API call carries the signed JWT.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/register">Create an account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/properties">Browse listings</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { role: "Tenant", text: "Request, pay & review" },
              { role: "Landlord", text: "List & approve" },
              { role: "Admin", text: "Moderate & measure" },
            ].map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-4 py-3"
              >
                <span className="text-sm font-semibold">{item.role}</span>
                <span className="text-xs text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

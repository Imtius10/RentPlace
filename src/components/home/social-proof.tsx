"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CreditCard,
  LayoutDashboard,
  MousePointerClick,
  Quote,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchCategories, fetchProperties, queryKeys } from "@/lib/queries";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified landlords",
    text: "Every listing is owned by a checked landlord account — no ghost posters.",
    tint: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: MousePointerClick,
    title: "Request in one tap",
    text: "Send a rental request from the listing page and track it live in your dashboard.",
    tint: "text-sky-600 bg-sky-500/10",
  },
  {
    icon: CreditCard,
    title: "Stripe-secure rent",
    text: "Pay online with Stripe Checkout and keep a verifiable receipt for every payment.",
    tint: "text-violet-600 bg-violet-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Admin-moderated",
    text: "A moderation team reviews listings, users and rentals so the marketplace stays clean.",
    tint: "text-amber-600 bg-amber-500/10",
  },
  {
    icon: LayoutDashboard,
    title: "Role-based dashboards",
    text: "Tenants, landlords and admins each get an inbox, stats and tools built for them.",
    tint: "text-indigo-600 bg-indigo-500/10",
  },
  {
    icon: Radar,
    title: "Smart filtering",
    text: "Search by city, category and price range — results update instantly without reloads.",
    tint: "text-rose-600 bg-rose-500/10",
  },
];

export function WhyRentPlace() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Why RentPlace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything a rental needs, in one flow
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            From the first search to the final receipt, each step is designed to
            remove friction — not add forms.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <span
                className={`inline-flex size-11 items-center justify-center rounded-2xl ${feature.tint}`}
              >
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsBand() {
  const listingsQuery = useQuery({
    queryKey: queryKeys.properties({ limit: 1, band: true }),
    queryFn: () => fetchProperties({ limit: 1 }),
    staleTime: 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const homes = listingsQuery.data?.meta?.total ?? 0;
  const categories = categoriesQuery.data?.length ?? 0;

  const stats = [
    { icon: Building2, value: homes > 0 ? String(homes) : "—", label: "live listings" },
    { icon: Sparkles, value: categories > 0 ? String(categories) : "—", label: "property categories" },
    { icon: CreditCard, value: "100%", label: "cash-free, online rent" },
    { icon: ShieldCheck, value: "24/7", label: "marketplace moderation" },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-14">
      <div className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-emerald-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="hero-grid absolute inset-0 opacity-20" />

      <div className="relative mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-300 backdrop-blur">
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "I sent a request at night, the landlord approved it before breakfast and rent was paid in a single Stripe checkout. No phone calls, no paperwork.",
    name: "Tanvir Rahman",
    role: "Tenant · Dhaka",
  },
  {
    quote:
      "Listing my flat took two minutes and the requests arrive in one inbox. Approving or rejecting is a single click from my dashboard.",
    name: "Imtius Ahmed",
    role: "Landlord · 3 listings",
  },
  {
    quote:
      "As a student I was worried about fake ads. Every landlord here is verified and every payment leaves a receipt I can actually show.",
    name: "Sadia Mim",
    role: "Tenant · Chattogram",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Loved by renters & owners</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          What people say about renting here
        </h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <motion.figure
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
          >
            <Quote className="size-6 text-primary/60" />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {item.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
              <span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
              <span className="ml-auto inline-flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star key={star} className="size-3.5 fill-current" />
                ))}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

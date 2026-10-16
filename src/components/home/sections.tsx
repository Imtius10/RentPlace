"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, KeyRound, ShieldCheck, Wallet } from "lucide-react";
import { fetchCategories, queryKeys } from "@/lib/queries";
import { categoryImage } from "@/lib/images";
import { categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Categories() {
  const { data = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const categories = data.length > 0 ? data : ["apartment", "house", "villa", "studio"];
  const visible = categories.slice(0, 6);

  return (
    <section className="relative border-y border-border/60 bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" /> Browse by need
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Popular categories
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Jump straight into the kind of home you are looking for — every tile
              opens a pre-filtered search.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/properties">
              All listings <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {visible.map((category, index) => {
            const Icon = categoryIcon(category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="h-full"
              >
                <Link
                  href={`/properties?category=${encodeURIComponent(category)}`}
                  className={cn(
                    "group relative flex h-44 flex-col justify-end overflow-hidden rounded-3xl border border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  <Image
                    src={categoryImage(category)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <span className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-brand-gradient">
                    <Icon className="size-4" />
                  </span>

                  <div className="relative p-4">
                    <p className="text-sm font-semibold capitalize text-white">
                      {category}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/70 transition-colors group-hover:text-white">
                      Explore <ArrowRight className="size-3" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: KeyRound,
    title: "Discover",
    text: "Filter by location, price and type to find a place that actually fits.",
  },
  {
    icon: ShieldCheck,
    title: "Request & approve",
    text: "Send a rental request. Landlords approve or reject it from their dashboard.",
  },
  {
    icon: Wallet,
    title: "Pay securely",
    text: "Checkout with Stripe and get an instant, verifiable receipt.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">How RentPlace works</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Three steps from search to keys
        </h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6"
          >
            <span className="absolute right-5 top-4 text-5xl font-semibold text-muted/60">
              0{index + 1}
            </span>
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-emerald-600/20">
              <step.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function LandlordCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -left-10 top-0 size-48 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 size-56 rounded-full bg-black/10 blur-3xl" />

        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Own a place? Turn it into income this week.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">
          Publish a listing in under two minutes, receive requests in one tidy
          inbox and approve them with a single click.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-emerald-700 hover:bg-white/90"
          >
            <Link href="/auth/register?role=landlord">Start listing free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/properties">See what&apos;s trending</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

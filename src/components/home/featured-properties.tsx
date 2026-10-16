"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { PropertyGridSkeleton } from "@/components/property-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiError, errorMessage } from "@/lib/api";
import { fetchProperties, queryKeys } from "@/lib/queries";

export function FeaturedProperties() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.properties({ limit: 6, featured: true }),
    queryFn: () => fetchProperties({ limit: 6 }),
  });

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Handpicked for you</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured properties
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Fresh listings added by verified landlords, updated in real time.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/properties">
            View all listings <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <PropertyGridSkeleton count={6} />
        ) : isError ? (
          <EmptyState
            icon={Home}
            title="We couldn't load listings"
            description={errorMessage(error)}
            action={
              <Button onClick={() => refetch()}>
                {error instanceof ApiError && error.status === 0
                  ? "Retry connection"
                  : "Try again"}
              </Button>
            }
          />
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.35) }}
              >
                <PropertyCard property={property} priority={index < 3} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings yet"
            description="Be the first landlord to publish a property on RentPlace."
            action={
              <Button asChild>
                <Link href="/auth/register?role=landlord">List a property</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}

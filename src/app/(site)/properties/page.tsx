import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PropertiesBrowser,
  PropertiesPageSkeleton,
} from "@/components/properties/properties-browser";

export const metadata: Metadata = {
  title: "Browse rental properties",
  description:
    "Search rental properties by location, type and budget on RentPlace.",
};

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Suspense fallback={<PropertiesPageSkeleton />}>
        <PropertiesBrowser />
      </Suspense>
    </div>
  );
}

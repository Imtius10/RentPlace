import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedProperties } from "@/components/home/featured-properties";
import {
  Categories,
  HowItWorks,
  LandlordCTA,
} from "@/components/home/sections";
import {
  StatsBand,
  Testimonials,
  WhyRentPlace,
} from "@/components/home/social-proof";

export const metadata: Metadata = {
  title: "RentPlace — Find & List Rental Properties with Ease",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <div id="featured-anchor" />
      <FeaturedProperties />
      <WhyRentPlace />
      <HowItWorks />
      <StatsBand />
      <Testimonials />
      <LandlordCTA />
    </>
  );
}

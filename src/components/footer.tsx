import Link from "next/link";
import { AtSign, Globe, Heart, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Find &amp; list rental properties with ease. A modern marketplace
            connecting tenants, landlords and admins.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/properties" className="hover:text-primary">
                All properties
              </Link>
            </li>
            <li>
              <Link href="/properties?category=apartment" className="hover:text-primary">
                Apartments
              </Link>
            </li>
            <li>
              <Link href="/properties?category=house" className="hover:text-primary">
                Houses
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">
                About RentPlace
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">For you</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/auth/register?role=tenant" className="hover:text-primary">
                I&apos;m looking to rent
              </Link>
            </li>
            <li>
              <Link href="/auth/register?role=landlord" className="hover:text-primary">
                I want to list a property
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-primary">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Stay in the loop</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Need help? Our team replies within one business day.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[Globe, AtSign, MessageCircle].map((Icon, index) => (
              <span
                key={index}
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-5">
        <p className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} RentPlace. All rights reserved.</span>
          <span className="inline-flex items-center gap-1">
            Built with <Heart className="size-3.5 text-red-500" /> Next.js
          </span>
        </p>
      </div>
    </footer>
  );
}

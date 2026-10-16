"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS, ROLE_LABEL } from "@/lib/nav";
import { dashboardPathForRole } from "@/lib/session";
import { initials } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <div className="hidden w-64 shrink-0 space-y-3 lg:block">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "guest") {
      router.replace(
        `/auth/login?next=${encodeURIComponent(pathname)}`
      );
      return;
    }
    if (status === "authed" && user) {
      const segment = pathname.split("/")[2]?.toUpperCase();
      if (
        (segment === "TENANT" ||
          segment === "LANDLORD" ||
          segment === "ADMIN") &&
        segment !== user.role
      ) {
        toast.error("That dashboard belongs to another role.");
        router.replace("/no-access");
      }
    }
  }, [status, user, pathname, router]);

  const navItems = useMemo(
    () => (user ? NAV_ITEMS[user.role] : []),
    [user]
  );

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    router.replace("/");
    router.refresh();
  };

  if (status !== "authed" || !user) {
    return <DashboardSkeleton />;
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item.href, item.exact)
              ? "bg-brand-gradient text-white shadow-sm shadow-emerald-600/20"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const sidebar = (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/50 lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Logo />
        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-3">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <Badge className="mt-2 border-0 bg-brand-gradient text-white">
            {ROLE_LABEL[user.role]}
          </Badge>
        </div>

        <div className="mt-5 flex-1">{sidebarContent}</div>

        <Separator className="my-4" />
        <Button asChild variant="ghost" className="justify-start">
          <Link href="/">
            <ExternalLink className="size-4" /> View marketplace
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-red-600 hover:text-red-600 dark:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/60 glass px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open dashboard menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
                <Logo />
                <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-3">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <Badge className="mt-2 border-0 bg-brand-gradient text-white">
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </div>
                <div className="mt-5">{sidebarContent}</div>
                <div className="mt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/" onClick={() => setMobileOpen(false)}>
                      <ExternalLink className="size-4" /> View marketplace
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 lg:hidden">
              <Logo markOnly />
              <span className="text-sm font-semibold">Dashboard</span>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <LayoutDashboard className="size-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {ROLE_LABEL[user.role]} workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none ring-ring/50 transition focus-visible:ring-2">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardPathForRole(user.role)}>
                    <LayoutDashboard className="size-4" /> My dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/properties">
                    <ExternalLink className="size-4" /> Browse properties
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          RentPlace dashboard · signed in as {user.email}
          <span className="mx-2 opacity-40">•</span>
          <UserIcon className="inline size-3" /> {ROLE_LABEL[user.role]}
        </footer>
      </div>
    </div>
  );
}

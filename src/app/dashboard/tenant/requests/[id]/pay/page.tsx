"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { api, errorMessage } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { fetchMyPayments, queryKeys } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/format";
import { toUiStatus } from "@/lib/status";
import type { RentalRequest } from "@/lib/types";

export default function PayRequestPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;
  const [redirecting, setRedirecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const requestQuery = useQuery({
    queryKey: ["rental", requestId],
    queryFn: async () => {
      const res = await api.get<RentalRequest>(`/api/rentals/${requestId}`);
      return res.data;
    },
    enabled: Boolean(requestId),
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.myPayments(1),
    queryFn: () => fetchMyPayments(1),
  });

  const payment = (paymentsQuery.data?.items ?? []).find(
    (item) => item.rentalRequestId === requestId
  );
  const alreadyPaid = payment?.status === "PAID";

  // Shared mutation wrapper: consistent toast + error state handling.
  const createCheckout = useApiMutation<
    void,
    { checkoutUrl: string; sessionId: string }
  >({
    mutationFn: async () => {
      const res = await api.post<{ checkoutUrl: string; sessionId: string }>(
        "/api/payments/create",
        { rentalRequestId: requestId }
      );
      return res.data;
    },
    onSuccess: (data) => {
      setLocalError(null);
      if (data.checkoutUrl) {
        setRedirecting(true);
        window.location.href = data.checkoutUrl;
      } else {
        setLocalError("Stripe did not return a checkout URL.");
        setRedirecting(false);
      }
    },
    onError: (error) => {
      setLocalError(errorMessage(error));
      setRedirecting(false);
    },
  });

  const request = requestQuery.data;
  const uiStatus = request ? toUiStatus(request.status, payment) : "PENDING";

  if (requestQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (requestQuery.isError || !request) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-lg font-semibold">Request not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage(requestQuery.error)}
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/tenant/requests">Back to requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBlock =
    request.status !== "APPROVED" ? (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <p className="font-semibold">
          This request is {request.status.toLowerCase()}.
        </p>
        <p className="mt-1">
          {request.status === "PENDING"
            ? "Payment opens once the landlord approves your request."
            : "The landlord declined this request, so payment isn't possible."}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/tenant/requests">
            <ArrowLeft className="size-4" /> Back to requests
          </Link>
        </Button>
      </div>
    ) : alreadyPaid ? (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-4" /> Rent already paid
        </p>
        <p className="mt-1">
          Transaction {payment?.transactionId ?? "recorded"} ·{" "}
          {formatDate(payment?.createdAt ?? new Date())}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/tenant/payments">
            <Wallet className="size-4" /> View payment history
          </Link>
        </Button>
      </div>
    ) : (
      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Amount due</p>
            <p className="text-3xl font-semibold tracking-tight">
              {formatPrice(request.property?.price ?? 0)}
            </p>
          </div>
          <Badge className="border-0 bg-brand-gradient text-white">
            First month
          </Badge>
        </div>

        <Separator className="my-5" />

        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Payments are processed by Stripe Checkout — card details never touch
            RentPlace.
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            You&apos;ll be redirected to Stripe and brought back here automatically.
          </li>
        </ul>

        {localError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {localError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            disabled={createCheckout.isPending || redirecting}
            onClick={() => createCheckout.mutate()}
          >
            {createCheckout.isPending || redirecting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Opening Stripe…
              </>
            ) : (
              <>
                <CreditCard className="size-4" /> Pay securely with Stripe
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/tenant/requests">Not now</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Complete your payment"
        description="Review the booking, then continue to Stripe Checkout."
        action={<StatusBadge status={uiStatus} />}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {request.property?.title ?? "Property"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {request.property?.location}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Monthly rent</p>
              <p className="font-semibold">
                {formatPrice(request.property?.price ?? 0)}
              </p>
            </div>
          </div>

          <Separator className="my-5" />

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-muted-foreground">Landlord</dt>
              <dd className="flex items-center gap-1 font-medium">
                {request.property?.landlord?.name ?? "Host"}
                <BadgeCheck className="size-4 text-primary" />
              </dd>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-muted-foreground">Requested on</dt>
              <dd className="font-medium">{formatDate(request.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-muted-foreground">Request status</dt>
              <dd>
                <StatusBadge status={uiStatus} />
              </dd>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-muted-foreground">Payment status</dt>
              <dd className="font-medium">
                {payment ? payment.status.toLowerCase() : "not started"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {statusBlock}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pager } from "@/components/ui/pager";
import { PageHeader } from "@/components/dashboard/page-header";
import { api, errorMessage } from "@/lib/api";
import { fetchAdminProperties, queryKeys } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/format";

export default function AdminPropertiesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const queryKey = queryKeys.adminProperties(page);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAdminProperties(page),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/properties/${id}`);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStatistics });
      toast.success("Property removed from the platform");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All properties"
        description="Moderate listings across every landlord on RentPlace."
      />

      <Card>
        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="p-5">
              <EmptyState
                title="Listings couldn't be loaded"
                description={errorMessage(query.error)}
                action={<Button onClick={() => query.refetch()}>Retry</Button>}
              />
            </div>
          ) : items.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No properties yet" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Link
                          href={`/properties/${property.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {property.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {property.location} · {property.category}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{property.landlord?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.landlord?.email}
                        </p>
                      </TableCell>
                      <TableCell>{formatPrice(property.price)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(property.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/properties/${property.id}`}>
                              <Eye className="size-4" />
                              <span className="sr-only">View listing</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Delete listing</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete “{property.title}”?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  The listing is removed for everyone,
                                  including existing rental requests. This
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove.mutate(property.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  {remove.isPending ? "Deleting…" : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pager meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}

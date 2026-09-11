import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Destination } from '@/types';

type RecentDestination = Pick<
    Destination,
    'id' | 'name' | 'location' | 'category' | 'status' | 'image' | 'created_at'
>;

type RecentDestinationsProps = {
    destinations: RecentDestination[];
};

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(
        new Date(value),
    );

const statusVariant = (
    status: RecentDestination['status'],
): 'default' | 'secondary' | 'outline' => {
    if (status === 'published') return 'default';
    if (status === 'archived') return 'outline';
    return 'secondary';
};

export default function RecentDestinations({
    destinations,
}: RecentDestinationsProps) {
    return (
        <Card className="border-stone-200/80 bg-[#fffdf8] shadow-[0_14px_35px_-26px_rgba(31,61,48,0.8)]">
            <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle>Recently added</CardTitle>
                    <p className="mt-1 text-sm text-stone-500">
                        The latest destinations added to your collection.
                    </p>
                </div>
                <Link
                    href="/destinations"
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                    View all <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent>
                {destinations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
                        No destinations have been added yet.
                    </div>
                ) : (
                    <div className="divide-y divide-stone-200">
                        {destinations.map((destination) => (
                            <Link
                                key={destination.id}
                                href={`/destinations/${destination.id}`}
                                className="flex items-center gap-4 rounded-lg py-4 transition-colors first:pt-0 last:pb-0 hover:bg-emerald-50/60"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">
                                    {destination.image ? (
                                        <img
                                            src={`/storage/${destination.image}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <MapPin className="h-6 w-6" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-medium text-emerald-950">
                                            {destination.name}
                                        </p>
                                        <Badge
                                            variant={statusVariant(
                                                destination.status,
                                            )}
                                            className="capitalize"
                                        >
                                            {destination.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-stone-600">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        {destination.location}
                                    </p>
                                </div>
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-medium text-emerald-900">
                                        {destination.category}
                                    </p>
                                    <p className="mt-1 text-xs text-stone-500">
                                        {formatDate(destination.created_at)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    LoaderCircle,
    MapPin,
    Navigation,
    Phone,
    Route as RouteIcon,
    Trash2,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/modal';
import type { Destination } from '@/types';

type DestinationShowProps = {
    destination: Destination;
    isAdmin: boolean;
    canDelete: boolean;
};

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(
        new Date(value),
    );

export default function DestinationShow({
    destination,
    isAdmin,
    canDelete,
}: DestinationShowProps) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const imageUrl = destination.image ? `/storage/${destination.image}` : null;
    const hasCoordinates =
        destination.latitude !== null && destination.longitude !== null;
    const mapsUrl = hasCoordinates
        ? `https://www.google.com/maps?q=${destination.latitude},${destination.longitude}`
        : null;

    const deleteDestination = (): void => {
        setDeleting(true);
        router.delete(`/destinations/${destination.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={destination.name} />
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/destinations"
                        className="text-sm font-medium text-emerald-800 transition-colors hover:text-amber-700"
                    >
                        ← Back to destinations
                    </Link>
                    <div className="flex flex-wrap justify-end gap-2">
                        {canDelete ? (
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteOpen(true)}
                                disabled={deleting}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        ) : null}
                        {isAdmin ? (
                            <Link href={`/destinations/${destination.id}/edit`}>
                                <Button variant="outline">
                                    Edit destination
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </div>

                <article className="overflow-hidden rounded-4xl border border-stone-200/80 bg-[#fffdf8] shadow-[0_22px_55px_-34px_rgba(31,61,48,0.75)]">
                    <div className="h-70 overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-50 sm:h-90">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={destination.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-emerald-700">
                                <MapPin className="h-16 w-16 opacity-50" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-8 p-6 md:p-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <Badge>{destination.category}</Badge>
                                    {destination.difficulty ? (
                                        <Badge variant="secondary">
                                            {destination.difficulty}
                                        </Badge>
                                    ) : null}
                                </div>
                                <h1 className="text-4xl leading-tight font-semibold text-emerald-950 md:text-6xl">
                                    {destination.name}
                                </h1>
                                <div className="mt-3 flex items-center gap-2 text-stone-600">
                                    <MapPin className="h-4 w-4 text-emerald-700" />
                                    <span>{destination.location}</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left md:text-right">
                                <p className="text-sm text-amber-800">
                                    Entrance fee
                                </p>
                                <p className="text-2xl font-bold text-emerald-950">
                                    {formatCurrency(
                                        Number(destination.entrance_fee ?? 0),
                                    )}
                                </p>
                            </div>
                        </div>
                        <p className="max-w-3xl text-lg leading-8 text-stone-700">
                            {destination.description}
                        </p>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <Detail
                                label="Opening hours"
                                icon={
                                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                                }
                            >
                                {destination.opening_hours ?? 'Not specified'}
                            </Detail>
                            <Detail
                                label="Contact"
                                icon={
                                    <Phone className="h-4 w-4 text-emerald-700" />
                                }
                            >
                                {destination.contact ?? 'Not specified'}
                            </Detail>
                            <Detail
                                label="Status"
                                icon={
                                    <RouteIcon className="h-4 w-4 text-emerald-700" />
                                }
                            >
                                {destination.status}
                            </Detail>
                            <Detail
                                label="Coordinates"
                                icon={
                                    <Navigation className="h-4 w-4 text-emerald-700" />
                                }
                            >
                                {hasCoordinates
                                    ? `${destination.latitude?.toFixed(5)}, ${destination.longitude?.toFixed(5)}`
                                    : 'Not available'}
                            </Detail>
                        </div>
                        {mapsUrl ? (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-950"
                            >
                                <Navigation className="h-4 w-4" />
                                Navigate with Google Maps
                            </a>
                        ) : null}
                        <div className="grid gap-4 border-t border-stone-200 pt-6 text-sm text-stone-600 md:grid-cols-2">
                            <div>
                                <p className="font-medium text-slate-800">
                                    Created
                                </p>
                                <p>{formatDate(destination.created_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">
                                    Updated
                                </p>
                                <p>{formatDate(destination.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Delete destination?
                        </ModalTitle>
                        <ModalDescription>
                            This permanently deletes {destination.name} and its
                            stored image. This action cannot be undone.
                        </ModalDescription>
                    </ModalHeader>
                    <ModalFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={deleteDestination}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {deleting ? 'Deleting...' : 'Delete permanently'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

function Detail({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                {icon}
                {label}
            </div>
            <p className="text-base font-medium text-slate-900 capitalize">
                {children}
            </p>
        </div>
    );
}

DestinationShow.layout = {
    breadcrumbs: [
        { title: 'Destinations', href: '/destinations' },
        { title: 'Details', href: '#' },
    ],
};

import { Head, router } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react';
import * as React from 'react';

import DestinationForm from '@/pages/destinations/DestinationForm';
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

export default function EditDestination({
    destination,
}: {
    destination: Destination;
}) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    const deleteDestination = (): void => {
        setDeleting(true);
        router.delete(`/destinations/${destination.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={`Edit ${destination.name}`} />
            <div className="mx-auto max-w-5xl space-y-8 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium tracking-[0.24em] text-amber-700 uppercase">
                            Latawan / Admin
                        </p>
                        <h1 className="text-4xl leading-tight font-semibold text-emerald-950 md:text-5xl">
                            Edit destination
                        </h1>
                        <p className="text-stone-600">
                            Update the details and image for {destination.name}.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                        disabled={deleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </header>
                <section className="rounded-[2rem] border border-stone-200/80 bg-[#fffdf8] p-5 text-emerald-950 shadow-[0_18px_45px_-30px_rgba(31,61,48,0.75)] md:p-8">
                    <DestinationForm
                        destination={destination}
                        submitUrl={`/destinations/${destination.id}`}
                        method="put"
                        submitLabel="Save changes"
                        onCancel={() => window.history.back()}
                    />
                </section>
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

import { Head } from '@inertiajs/react';

import DestinationForm from '@/pages/destinations/DestinationForm';

export default function CreateDestination() {
    return (
        <>
            <Head title="Add destination" />
            <div className="mx-auto max-w-5xl space-y-8 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <header className="space-y-2">
                    <p className="text-sm font-medium tracking-[0.24em] text-amber-700 uppercase">
                        Latawan / Admin
                    </p>
                    <h1 className="text-4xl leading-tight font-semibold text-emerald-950 md:text-5xl">
                        Add a destination
                    </h1>
                    <p className="text-stone-600">
                        Capture the details travelers need to plan their next
                        visit.
                    </p>
                </header>
                <section className="rounded-[2rem] border border-stone-200/80 bg-[#fffdf8] p-5 text-emerald-950 shadow-[0_18px_45px_-30px_rgba(31,61,48,0.75)] md:p-8">
                    <DestinationForm
                        submitUrl="/destinations"
                        method="post"
                        submitLabel="Create destination"
                        onCancel={() => window.history.back()}
                    />
                </section>
            </div>
        </>
    );
}

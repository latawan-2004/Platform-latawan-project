import { Head } from '@inertiajs/react';

import RecentDestinations from '@/components/dashboard/RecentDestinations';
import StatCard from '@/components/dashboard/StatCard';
import { dashboard } from '@/routes';
import type { Destination } from '@/types';

type DashboardStatistics = {
    total: number;
    published: number;
    draft: number;
    archived: number;
    categories: number;
    average_entrance_fee: number;
};

type DashboardProps = {
    statistics: DashboardStatistics;
    recentDestinations: Array<
        Pick<
            Destination,
            | 'id'
            | 'name'
            | 'location'
            | 'category'
            | 'status'
            | 'image'
            | 'created_at'
        >
    >;
};

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);

export default function Dashboard({
    statistics,
    recentDestinations,
}: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8">
                <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 px-6 py-9 text-white shadow-[0_22px_50px_-28px_rgba(31,61,48,0.9)] md:px-10 md:py-12">
                    <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-200/10 to-transparent" />
                    <p className="relative text-sm font-medium tracking-[0.24em] text-amber-200 uppercase">
                        Latawan / Overview
                    </p>
                    <h1 className="relative mt-3 text-4xl leading-tight font-semibold md:text-5xl">
                        Destination dashboard
                    </h1>
                    <p className="relative mt-3 max-w-2xl text-emerald-100">
                        A quick view of your destination collection and its
                        publishing status.
                    </p>
                </header>

                <section
                    aria-label="Destination statistics"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <StatCard
                        label="Total destinations"
                        value={statistics.total}
                        description="All records in the collection"
                        icon="total"
                    />
                    <StatCard
                        label="Published"
                        value={statistics.published}
                        description="Visible to public visitors"
                        tone="emerald"
                        icon="published"
                    />
                    <StatCard
                        label="Draft"
                        value={statistics.draft}
                        description="Still being prepared"
                        tone="amber"
                        icon="draft"
                    />
                    <StatCard
                        label="Archived"
                        value={statistics.archived}
                        description="No longer active"
                        tone="rose"
                        icon="archived"
                    />
                    <StatCard
                        label="Total categories"
                        value={statistics.categories}
                        description="Categories currently in use"
                        tone="slate"
                        icon="categories"
                    />
                    <StatCard
                        label="Average entrance fee"
                        value={formatCurrency(statistics.average_entrance_fee)}
                        description="Across all destinations"
                        tone="emerald"
                        icon="fee"
                    />
                </section>

                <RecentDestinations destinations={recentDestinations} />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

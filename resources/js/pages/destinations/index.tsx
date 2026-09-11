import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Destination } from '@/types';

type SortValue =
    | 'newest'
    | 'oldest'
    | 'name_asc'
    | 'name_desc'
    | 'fee_asc'
    | 'fee_desc';

type DestinationFilters = {
    search?: string;
    category?: string;
    difficulty?: string;
    sort?: SortValue;
    page?: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedDestinations = {
    data: Destination[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
};

type DestinationIndexProps = {
    destinations: PaginatedDestinations;
    filters: DestinationFilters;
    isAdmin: boolean;
};

const categoryOptions = [
    'Waterfall',
    'Mountain & Peak',
    'Beach & Coast',
    'Cave & Underground',
    'Forest & Trail',
    'River & Spring',
    'Lake',
    'Island & Sandbar',
    'Heritage & Cultural',
    'Camping & Eco-Park',
] as const;

const difficultyOptions = ['Easy', 'Moderate', 'Hard', 'Challenging'] as const;

const sortOptions: Array<{ value: SortValue; label: string }> = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'name_asc', label: 'Name A–Z' },
    { value: 'name_desc', label: 'Name Z–A' },
    { value: 'fee_asc', label: 'Lowest fee' },
    { value: 'fee_desc', label: 'Highest fee' },
];

const getDestinationHref = (destinationId: number): string =>
    `/destinations/${destinationId}`;

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);
};

const buildRouteParams = (
    filters: DestinationFilters,
    override: Partial<DestinationFilters>,
): Record<string, string> => {
    const params: Record<string, string> = {};
    const merged: DestinationFilters = {
        ...filters,
        ...override,
    };

    if (merged.search?.trim()) {
        params.search = merged.search.trim();
    }
    if (merged.category) {
        params.category = merged.category;
    }
    if (merged.difficulty) {
        params.difficulty = merged.difficulty;
    }
    if (merged.sort && merged.sort !== 'newest') {
        params.sort = merged.sort;
    }
    if (merged.page && merged.page > 1) {
        params.page = String(merged.page);
    }

    return params;
};

function DestinationCard({ destination }: { destination: Destination }) {
    const imageUrl = destination.image ? `/storage/${destination.image}` : null;

    return (
        <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-[#fffdf8] shadow-[0_10px_30px_-20px_rgba(31,61,48,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_-22px_rgba(31,61,48,0.65)]">
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={destination.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-emerald-700">
                        <MapPin className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                        variant="secondary"
                        className="bg-[#fffdf8]/90 text-emerald-950 shadow-sm backdrop-blur-sm"
                    >
                        {destination.category}
                    </Badge>
                    {destination.difficulty ? (
                        <Badge
                            variant="outline"
                            className="border-white/70 bg-[#fffdf8]/90 text-emerald-950 shadow-sm backdrop-blur-sm"
                        >
                            {destination.difficulty}
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-xl leading-tight font-semibold text-emerald-950">
                            {destination.name}
                        </h2>
                        <span className="shrink-0 text-sm font-semibold text-amber-700">
                            {formatCurrency(
                                Number(destination.entrance_fee ?? 0),
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <MapPin className="h-4 w-4 text-emerald-700" />
                        <span>{destination.location}</span>
                    </div>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-stone-600">
                    {destination.description}
                </p>

                <Link
                    href={getDestinationHref(destination.id)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-colors hover:text-amber-700"
                >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}

export default function DestinationsIndex({
    destinations,
    filters,
    isAdmin,
}: DestinationIndexProps) {
    const safeFilters: DestinationFilters =
        filters && typeof filters === 'object' ? { ...filters } : {};
    const safeDestinations: PaginatedDestinations =
        destinations && typeof destinations === 'object'
            ? destinations
            : {
                  data: [],
                  current_page: 1,
                  last_page: 1,
                  per_page: 12,
                  total: 0,
                  from: 0,
                  to: 0,
                  links: [],
              };

    const initialSort: SortValue =
        safeFilters.sort &&
        sortOptions.some((option) => option.value === safeFilters.sort)
            ? safeFilters.sort
            : 'newest';

    const [search, setSearch] = React.useState<string>(
        safeFilters.search ?? '',
    );
    const [category, setCategory] = React.useState<string>(
        safeFilters.category ?? 'all',
    );
    const [difficulty, setDifficulty] = React.useState<string>(
        safeFilters.difficulty ?? 'all',
    );
    const [sortValue, setSortValue] = React.useState<SortValue>(initialSort);

    React.useEffect(() => {
        setSearch(safeFilters.search ?? '');
    }, [safeFilters.search]);

    React.useEffect(() => {
        setCategory(safeFilters.category ?? 'all');
    }, [safeFilters.category]);

    React.useEffect(() => {
        setDifficulty(safeFilters.difficulty ?? 'all');
    }, [safeFilters.difficulty]);

    React.useEffect(() => {
        setSortValue(initialSort);
    }, [safeFilters.sort]);

    const normalizedFilters = {
        search: safeFilters.search ?? '',
        category: safeFilters.category ?? '',
        difficulty: safeFilters.difficulty ?? '',
        sort: initialSort,
        page:
            Number(safeFilters.page ?? 1) > 0
                ? Number(safeFilters.page ?? 1)
                : 1,
    } satisfies DestinationFilters;

    const applyFilters = (nextOverrides: Partial<DestinationFilters>): void => {
        const params = buildRouteParams(normalizedFilters, nextOverrides);

        router.get('/destinations', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();
        applyFilters({ search, page: 1 });
    };

    const handleCategoryChange = (value: string): void => {
        const normalized = value === 'all' ? '' : value;
        setCategory(value);
        applyFilters({ category: normalized, page: 1 });
    };

    const handleDifficultyChange = (value: string): void => {
        const normalized = value === 'all' ? '' : value;
        setDifficulty(value);
        applyFilters({ difficulty: normalized, page: 1 });
    };

    const handleSortChange = (value: string): void => {
        const nextSort = value as SortValue;
        setSortValue(nextSort);
        applyFilters({ sort: nextSort, page: 1 });
    };

    const handlePagination = (targetPage: number): void => {
        if (targetPage < 1 || targetPage > safeDestinations.last_page) {
            return;
        }

        applyFilters({ page: targetPage });
    };

    const paginationItems = Array.isArray(safeDestinations.links)
        ? safeDestinations.links.map((link) => ({
              ...link,
              isLabel:
                  link.label === '&laquo; Previous' ||
                  link.label === 'Next &raquo;',
          }))
        : [];

    return (
        <>
            <Head title="Explore Destinations" />

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <header className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 px-6 py-9 text-white shadow-[0_22px_50px_-28px_rgba(31,61,48,0.9)] md:px-10 md:py-12">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-medium tracking-[0.24em] text-amber-200 uppercase">
                                Latawan / Discover
                            </p>
                            <h1 className="mt-3 max-w-2xl text-4xl leading-[1.05] font-semibold md:text-6xl">
                                Places worth taking the long way to.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-100 md:text-base">
                                Find waterfalls, coastlines, peaks, and quiet
                                corners across the Philippines.
                            </p>
                        </div>

                        {isAdmin ? (
                            <Link href="/destinations/create">
                                <Button
                                    variant="secondary"
                                    className="bg-amber-200 text-emerald-950 shadow-md hover:bg-amber-100"
                                >
                                    Add destination
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </header>

                <section className="rounded-2xl border border-stone-200/80 bg-[#fffdf8]/90 p-4 shadow-[0_12px_35px_-28px_rgba(31,61,48,0.8)] backdrop-blur md:p-5">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex flex-col gap-3 lg:flex-row"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                ) => setSearch(event.target.value)}
                                placeholder="Search by name, location, or category"
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="min-w-[180px]">
                                <select
                                    value={category}
                                    onChange={(event) =>
                                        handleCategoryChange(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 py-2 text-sm text-emerald-950 ring-offset-2 transition focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                                >
                                    <option value="all">All categories</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[180px]">
                                <select
                                    value={difficulty}
                                    onChange={(event) =>
                                        handleDifficultyChange(
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 py-2 text-sm text-emerald-950 ring-offset-2 transition focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                                >
                                    <option value="all">All difficulty</option>
                                    {difficultyOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[180px]">
                                <select
                                    value={sortValue}
                                    onChange={(event) =>
                                        handleSortChange(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 py-2 text-sm text-emerald-950 ring-offset-2 transition focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="gap-2 bg-emerald-800 shadow-sm hover:bg-emerald-950"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Apply
                            </Button>
                        </div>
                    </form>
                </section>

                {safeDestinations.data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <p className="text-xl font-semibold text-slate-900">
                            No destinations match your filters.
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            Try a different search term or clear some filters to
                            discover more places.
                        </p>
                        <div className="mt-5 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setCategory('all');
                                    setDifficulty('all');
                                    setSortValue('newest');
                                    router.get(
                                        '/destinations',
                                        {},
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }}
                            >
                                Reset filters
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {safeDestinations.data.map((destination) => (
                                <DestinationCard
                                    key={destination.id}
                                    destination={destination}
                                />
                            ))}
                        </div>

                        {safeDestinations.last_page > 1 ? (
                            <nav className="flex flex-wrap items-center justify-center gap-2 pt-4">
                                {paginationItems.map((link, index) => {
                                    const label = link.label
                                        .replace(/&laquo;|&raquo;/g, '')
                                        .trim();
                                    const isActive = link.active;
                                    const isDisabled = !link.url;

                                    return (
                                        <button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            onClick={() => {
                                                if (link.url) {
                                                    const nextUrl = new URL(
                                                        link.url,
                                                        window.location.origin,
                                                    );
                                                    const page = Number(
                                                        nextUrl.searchParams.get(
                                                            'page',
                                                        ) ?? 1,
                                                    );
                                                    handlePagination(page);
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className={[
                                                'rounded-md border px-3 py-2 text-sm transition-colors',
                                                isActive
                                                    ? 'border-emerald-700 bg-emerald-700 text-white'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                                                isDisabled
                                                    ? 'cursor-not-allowed opacity-50'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            {label || link.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        ) : null}
                    </>
                )}
            </div>
        </>
    );
}

DestinationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Destinations',
            href: '/destinations',
        },
    ],
};

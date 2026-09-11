<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display destination management statistics for administrators.
     */
    public function __invoke(): Response
    {
        $statistics = [
            'total' => Destination::query()->count(),
            'published' => Destination::query()->where('status', 'published')->count(),
            'draft' => Destination::query()->where('status', 'draft')->count(),
            'archived' => Destination::query()->where('status', 'archived')->count(),
            'categories' => Destination::query()->distinct('category')->count('category'),
            'average_entrance_fee' => round((float) (Destination::query()->avg('entrance_fee') ?? 0), 2),
        ];

        $recentDestinations = Destination::query()
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'location', 'category', 'status', 'image', 'created_at']);

        return Inertia::render('dashboard', [
            'statistics' => $statistics,
            'recentDestinations' => $recentDestinations,
        ]);
    }
}

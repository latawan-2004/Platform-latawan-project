<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Models\Destination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DestinationController extends Controller
{
    /**
     * Display a paginated, searchable, filterable, sortable listing of destinations.
     *
     * Public visitors only see published rows; admins see all.
     */
    public function index(Request $request): Response
    {
        $isAdmin = $request->user()?->is_admin ?? false;

        $query = Destination::query()
            ->when(! $isAdmin, fn ($q) => $q->where('status', 'published'))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('difficulty'), fn ($q) => $q->where('difficulty', $request->input('difficulty')))
            ->when($isAdmin && $request->filled('status'), fn ($q) => $q->where('status', $request->input('status')));

        $sort = $request->input('sort', 'newest');
        $query = match ($sort) {
            'oldest' => $query->oldest(),
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            'fee_asc' => $query->orderBy('entrance_fee'),
            'fee_desc' => $query->orderByDesc('entrance_fee'),
            default => $query->latest(), // newest
        };

        $destinations = $query->paginate(12)->withQueryString();

        return Inertia::render('destinations/index', [
            'destinations' => $destinations,
            'filters' => $request->only(['search', 'category', 'difficulty', 'status', 'sort']),
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Show the form for creating a new destination.
     */
    public function create(): Response
    {
        Gate::authorize('create', Destination::class);

        return Inertia::render('destinations/create');
    }

    /**
     * Store a newly created destination in storage.
     */
    public function store(StoreDestinationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('destinations', 'public');
        }

        $destination = Destination::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Destination created successfully.']);

        return to_route('destinations.show', $destination);
    }

    /**
     * Display the specified destination.
     */
    public function show(Request $request, Destination $destination): Response
    {
        Gate::authorize('view', $destination);

        return Inertia::render('destinations/show', [
            'destination' => $destination,
            'isAdmin' => $request->user()?->is_admin ?? false,
            'canDelete' => $request->user()?->can('delete', $destination) ?? false,
        ]);
    }

    /**
     * Show the form for editing the specified destination.
     */
    public function edit(Destination $destination): Response
    {
        Gate::authorize('update', $destination);

        return Inertia::render('destinations/edit', [
            'destination' => $destination,
        ]);
    }

    /**
     * Update the specified destination in storage.
     */
    public function update(UpdateDestinationRequest $request, Destination $destination): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Store new image first, then delete old one
            $newImagePath = $request->file('image')->store('destinations', 'public');
            $oldImagePath = $destination->image;

            $data['image'] = $newImagePath;

            $destination->update($data);

            if ($oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }
        } else {
            // No new image — keep existing path
            unset($data['image']);
            $destination->update($data);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Destination updated successfully.']);

        return to_route('destinations.show', $destination);
    }

    /**
     * Remove the specified destination from storage.
     * Deletes the associated image file before removing the DB row.
     */
    public function destroy(Destination $destination): RedirectResponse
    {
        Gate::authorize('delete', $destination);

        if ($destination->image) {
            Storage::disk('public')->delete($destination->image);
        }

        $destination->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Destination deleted successfully.']);

        return to_route('destinations.index');
    }

    /**
     * Publish the specified destination.
     */
    public function publish(Destination $destination): RedirectResponse
    {
        Gate::authorize('publish', $destination);

        $destination->update(['status' => 'published']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Destination published successfully.']);

        return to_route('destinations.show', $destination);
    }

    /**
     * Archive the specified destination.
     */
    public function archive(Destination $destination): RedirectResponse
    {
        Gate::authorize('archive', $destination);

        $destination->update(['status' => 'archived']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Destination archived successfully.']);

        return to_route('destinations.show', $destination);
    }
}

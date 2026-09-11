<?php

namespace App\Policies;

use App\Models\Destination;
use App\Models\User;

class DestinationPolicy
{
    /**
     * Determine whether the user can view any destinations (admin sees all, public sees published).
     * The index method handles its own visibility logic; we return true for the policy check.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific destination.
     * Public visitors can view published destinations; admins can view any.
     */
    public function view(?User $user, Destination $destination): bool
    {
        if ($destination->status === 'published') {
            return true;
        }

        return $user?->is_admin === true;
    }

    /**
     * Determine whether the user can create destinations.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the destination.
     */
    public function update(User $user, Destination $destination): bool
    {
        return $user->is_admin;
    }

    /**
     * Determine whether the user can delete the destination.
     */
    public function delete(User $user, Destination $destination): bool
    {
        return true;
    }

    /**
     * Determine whether the user can publish the destination.
     */
    public function publish(User $user, Destination $destination): bool
    {
        return $user->is_admin;
    }

    /**
     * Determine whether the user can archive the destination.
     */
    public function archive(User $user, Destination $destination): bool
    {
        return $user->is_admin;
    }
}

<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DestinationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Public destination routes — guests see published only (controller handles visibility)
Route::get('destinations', [DestinationController::class, 'index'])->name('destinations.index');

// Admin-only destination routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('destinations/create', [DestinationController::class, 'create'])->name('destinations.create');
    Route::post('destinations', [DestinationController::class, 'store'])->name('destinations.store');
    Route::get('destinations/{destination}/edit', [DestinationController::class, 'edit'])->name('destinations.edit');
    Route::put('destinations/{destination}', [DestinationController::class, 'update'])->name('destinations.update');
    Route::delete('destinations/{destination}', [DestinationController::class, 'destroy'])->name('destinations.destroy');

    // Custom status-change endpoints
    Route::post('destinations/{destination}/publish', [DestinationController::class, 'publish'])->name('destinations.publish');
    Route::post('destinations/{destination}/archive', [DestinationController::class, 'archive'])->name('destinations.archive');
});

Route::get('destinations/{destination}', [DestinationController::class, 'show'])->name('destinations.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';

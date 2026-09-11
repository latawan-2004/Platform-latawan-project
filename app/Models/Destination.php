<?php

namespace App\Models;

use Database\Factories\DestinationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    /** @use HasFactory<DestinationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'location',
        'description',
        'category',
        'entrance_fee',
        'opening_hours',
        'contact',
        'latitude',
        'longitude',
        'difficulty',
        'image',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'entrance_fee' => 'decimal:2',
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}

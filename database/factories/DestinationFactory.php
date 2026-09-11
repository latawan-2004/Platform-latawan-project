<?php

namespace Database\Factories;

use App\Models\Destination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Destination>
 */
class DestinationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
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
        ];

        $difficulties = ['Easy', 'Moderate', 'Hard', 'Challenging'];
        $statuses = ['draft', 'published', 'archived'];

        return [
            'name' => fake()->words(3, true),
            'location' => fake()->city().', Philippines',
            'description' => fake()->paragraphs(2, true),
            'category' => fake()->randomElement($categories),
            'entrance_fee' => fake()->randomFloat(2, 0, 500),
            'opening_hours' => fake()->boolean(70) ? '6:00 AM – 5:00 PM' : null,
            'contact' => fake()->boolean(60) ? fake()->phoneNumber() : null,
            'latitude' => fake()->latitude(5, 21),
            'longitude' => fake()->longitude(117, 127),
            'difficulty' => fake()->randomElement($difficulties),
            'image' => null,
            'status' => fake()->randomElement($statuses),
        ];
    }

    /**
     * Indicate the destination is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    /**
     * Indicate the destination is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Indicate the destination is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }
}

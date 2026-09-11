<?php

use App\Models\Destination;
use App\Models\User;

test('public visitors can browse published destinations only', function () {
    $publishedDestination = Destination::factory()->published()->create([
        'name' => 'Tinago Falls',
    ]);

    $draftDestination = Destination::factory()->draft()->create([
        'name' => 'Hidden Draft Cove',
    ]);

    $this->get(route('destinations.index'))
        ->assertOk()
        ->assertSee($publishedDestination->name)
        ->assertDontSee($draftDestination->name);

    $this->get(route('destinations.show', $publishedDestination))
        ->assertOk()
        ->assertSee($publishedDestination->name);

    $this->get(route('destinations.show', $draftDestination))
        ->assertForbidden();
});

test('guests are redirected away from protected destination routes', function () {
    $destination = Destination::factory()->published()->create();

    $this->get(route('destinations.create'))->assertRedirect(route('login'));
    $this->get(route('destinations.edit', $destination))->assertRedirect(route('login'));
    $this->post(route('destinations.store'), validDestinationPayload())->assertRedirect(route('login'));
    $this->put(route('destinations.update', $destination), validDestinationPayload())->assertRedirect(route('login'));
    $this->delete(route('destinations.destroy', $destination))->assertRedirect(route('login'));
    $this->post(route('destinations.publish', $destination))->assertRedirect(route('login'));
    $this->post(route('destinations.archive', $destination))->assertRedirect(route('login'));
});

test('authenticated non admin users can create and delete but cannot manage destinations', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $destination = Destination::factory()->published()->create();

    $this->actingAs($user);

    $this->get(route('destinations.create'))->assertOk();
    $this->get(route('destinations.edit', $destination))->assertForbidden();
    $this->post(route('destinations.store'), validDestinationPayload())->assertRedirect();
    $this->put(route('destinations.update', $destination), validDestinationPayload())->assertForbidden();
    $this->post(route('destinations.publish', $destination))->assertForbidden();
    $this->post(route('destinations.archive', $destination))->assertForbidden();
    $this->delete(route('destinations.destroy', $destination))->assertRedirect(route('destinations.index'));
});

test('admin users pass destination policy checks', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $destination = Destination::factory()->draft()->create();

    expect($admin->can('create', Destination::class))->toBeTrue()
        ->and($admin->can('update', $destination))->toBeTrue()
        ->and($admin->can('delete', $destination))->toBeTrue()
        ->and($admin->can('publish', $destination))->toBeTrue()
        ->and($admin->can('archive', $destination))->toBeTrue();

    $this->actingAs($admin)
        ->get(route('destinations.show', $destination))
        ->assertOk();
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validDestinationPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Mount Pulag',
        'location' => 'Kabayan, Benguet',
        'description' => 'A mountain destination known for cool trails and sunrise views.',
        'category' => 'Mountain & Peak',
        'entrance_fee' => 175,
        'opening_hours' => '5:00 AM - 5:00 PM',
        'contact' => 'Tourism Office',
        'latitude' => 16.5994,
        'longitude' => 120.8986,
        'difficulty' => 'Moderate',
        'status' => 'draft',
    ], $overrides);
}

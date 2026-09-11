<?php

namespace App\Http\Requests;

use App\Models\Destination;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDestinationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Destination::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'in:Waterfall,Mountain & Peak,Beach & Coast,Cave & Underground,Forest & Trail,River & Spring,Lake,Island & Sandbar,Heritage & Cultural,Camping & Eco-Park'],
            'entrance_fee' => ['nullable', 'numeric', 'min:0'],
            'opening_hours' => ['nullable', 'string'],
            'contact' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'difficulty' => ['nullable', 'in:Easy,Moderate,Hard,Challenging'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'status' => ['required', 'in:draft,published,archived'],
        ];
    }
}

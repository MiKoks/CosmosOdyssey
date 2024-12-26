<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PricelistFactory extends Factory
{
    protected $model = \App\Models\Pricelist::class;

    public function definition()
    {
        return [
            'data' => json_encode([
                'legs' => [],
                'validUntil' => now()->addDays(7)->toDateTimeString(), // 7 days validity
            ]),
            'valid_until' => now()->addDays(7),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

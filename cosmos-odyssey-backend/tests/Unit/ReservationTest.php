<?php

namespace Tests\Unit;

use App\Models\Pricelist;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Validation\ValidationException;


class ReservationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_reservation_with_valid_data()
    {
        $pricelist = Pricelist::factory()->create();

        $reservation = Reservation::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'routes' => json_encode(['route1', 'route2']),
            'total_price' => 1000.50,
            'total_travel_time' => 10,
            'company_names' => json_encode(['Company A', 'Company B']),
            'pricelist_id' => $pricelist->id,
        ]);


        $this->assertDatabaseHas('reservations', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'pricelist_id' => $pricelist->id,
        ]);
    }

     /** @test */
    public function it_prevents_reservation_if_pricelist_is_expired()
    {
        $expiredPricelist = Pricelist::factory()->create([
            'valid_until' => "2023-12-26 21:45:58", // Database column
            'data' => json_encode(['legs' => [], 'validUntil' => "2023-12-26 21:45:58"]), // JSON field
        ]);

        //dd($expiredPricelist->toArray());

        $response = $this->postJson('/api/reservations', [
            'first_name' => 'John2',
            'last_name' => 'Doe',
            'routes' => ['route1', 'route2'],
            'total_price' => 1000.50,
            'total_travel_time' => 10,
            'company_names' => ['Company A', 'Company B'],
            'pricelist_id' => $expiredPricelist->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['pricelist_id']);

        $this->assertDatabaseMissing('reservations', [
            'first_name' => 'John2',
            'last_name' => 'Doe',
            'pricelist_id' => $expiredPricelist->id,
        ]);
    }
}

<?php

namespace Tests\Unit;

use App\Models\Pricelist;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_reservation_with_valid_data()
    {
        // Create a valid pricelist
        $pricelist = Pricelist::factory()->create();

        // Create a reservation associated with the pricelist
        $reservation = Reservation::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'routes' => json_encode(['route1', 'route2']),
            'total_price' => 1000.50,
            'total_travel_time' => 10,
            'company_names' => json_encode(['Company A', 'Company B']),
            'pricelist_id' => $pricelist->id,
        ]);

        // Assert the reservation exists in the database
        $this->assertDatabaseHas('reservations', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'pricelist_id' => $pricelist->id,
        ]);
    }
}

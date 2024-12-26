<?php

namespace Tests\Unit;

use App\Models\Pricelist;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationDeletionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_deletes_reservations_when_pricelist_is_removed()
    {
        // Create a pricelist
        $pricelist = Pricelist::factory()->create();

        // Create a reservation linked to the pricelist
        $reservation = Reservation::create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'routes' => json_encode(['route1']),
            'total_price' => 500,
            'total_travel_time' => 5,
            'company_names' => json_encode(['Company A']),
            'pricelist_id' => $pricelist->id,
        ]);

        // Assert the reservation exists
        $this->assertDatabaseHas('reservations', ['id' => $reservation->id]);

        // Delete the pricelist
        $pricelist->delete();

        // Assert the reservation is removed
        $this->assertDatabaseMissing('reservations', ['id' => $reservation->id]);
    }
}

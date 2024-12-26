<?php

namespace Tests\Unit;

use App\Services\PricelistService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class PricelistServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_deletes_excess_pricelists_and_associated_reservations()
    {
        // Insert 17 pricelists and reservations with differing creation times
        for ($i = 1; $i <= 17; $i++) {
            DB::table('pricelists')->insert([
                'id' => $i,
                'data' => json_encode(['example' => 'data']),
                'valid_until' => now()->addDays(7),
                'created_at' => now()->subSeconds(17 - $i),
                'updated_at' => now()->subSeconds(17 - $i),
            ]);

            DB::table('reservations')->insert([
                'first_name' => 'Test',
                'last_name' => 'User',
                'routes' => json_encode(['route_1']),
                'total_price' => 100,
                'total_travel_time' => 2,
                'company_names' => json_encode(['Company A']),
                'pricelist_id' => $i,
                'created_at' => now()->subSeconds(17 - $i),
                'updated_at' => now()->subSeconds(17 - $i),
            ]);
        }

        // Log data before deletion
        //dump('Before deletion: Pricelists', DB::table('pricelists')->get());
        //dump('Before deletion: Reservations', DB::table('reservations')->get());

        // Call the deletion method
        $pricelistService = new \App\Services\PricelistService();
        $pricelistService->deleteObsoletePricelists();

        // Log data after deletion
        //dump('After deletion: Pricelists', DB::table('pricelists')->get());
        //dump('After deletion: Reservations', DB::table('reservations')->get());

        // Assert only 15 pricelists remain
        $this->assertEquals(15, DB::table('pricelists')->count());

        // Assert reservations linked to deleted pricelists are removed
        $this->assertDatabaseMissing('reservations', ['pricelist_id' => 1]);
        $this->assertDatabaseMissing('reservations', ['pricelist_id' => 2]);

        // Assert reservations linked to remaining pricelists still exist
        $this->assertDatabaseHas('reservations', ['pricelist_id' => 15]);
        $this->assertDatabaseHas('reservations', ['pricelist_id' => 16]);
    }

    /** @test */
    public function it_fetches_active_pricelist_from_api()
    {
        // Mock the HTTP response for the API
        Http::fake([
            'https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices' => Http::response([
                'validUntil' => now()->addDays(7)->toDateTimeString(),
                'legs' => [],
            ], 200),
        ]);

        // Instantiate the service
        $service = new \App\Services\PricelistService();

        // Fetch and store the pricelist using the service
        $success = $service->fetchAndStorePricelist();

        // Assert the pricelist was successfully fetched and stored
        $this->assertTrue($success);

        // Ensure the database has the pricelist with the valid_until date
        $this->assertDatabaseHas('pricelists', [
            'valid_until' => now()->addDays(7)->toDateTimeString(),
        ]);

        // Fetch the active pricelist using the service
        $activePricelist = $service->getActivePricelist();

        // Assert that the active pricelist is not null
        $this->assertNotNull($activePricelist);

        // Assert the valid_until date of the active pricelist is as expected
        $this->assertEquals(
            now()->addDays(7)->toDateTimeString(),
            $activePricelist->valid_until
        );

        // Assert the data is properly stored in JSON format
        $this->assertJson($activePricelist->data);
    }

     
}

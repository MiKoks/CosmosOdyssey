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

        //Log
        //dump('Before deletion: Pricelists', DB::table('pricelists')->get());
        //dump('Before deletion: Reservations', DB::table('reservations')->get());

        $pricelistService = new \App\Services\PricelistService();
        $pricelistService->deleteObsoletePricelists();

        //dump('After deletion: Pricelists', DB::table('pricelists')->get());
        //dump('After deletion: Reservations', DB::table('reservations')->get());

        $this->assertEquals(15, DB::table('pricelists')->count());
        $this->assertDatabaseMissing('reservations', ['pricelist_id' => 1]);
        $this->assertDatabaseMissing('reservations', ['pricelist_id' => 2]);
        $this->assertDatabaseHas('reservations', ['pricelist_id' => 15]);
        $this->assertDatabaseHas('reservations', ['pricelist_id' => 16]);
    }

    /** @test */
    public function it_fetches_active_pricelist_from_api()
    {
        Http::fake([
            'https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices' => Http::response([
                'validUntil' => now()->addDays(7)->toDateTimeString(),
                'legs' => [],
            ], 200),
        ]);


        $service = new \App\Services\PricelistService();
        $success = $service->fetchAndStorePricelist();

        $this->assertTrue($success);
        $this->assertDatabaseHas('pricelists', [
            'valid_until' => now()->addDays(7)->toDateTimeString(),
        ]);

        $activePricelist = $service->getActivePricelist();
        $this->assertNotNull($activePricelist);
        $this->assertEquals(
            now()->addDays(7)->toDateTimeString(),
            $activePricelist->valid_until
        );
        $this->assertJson($activePricelist->data);
    }

     
}

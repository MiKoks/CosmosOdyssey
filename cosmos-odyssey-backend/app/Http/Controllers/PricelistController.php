<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PricelistController extends Controller
{
    public function fetchActivePricelists()
    {
        #kuna hetkel pole live keskkond
        $response = Http::withOptions(['verify' => false])->get('https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices');

        if ($response->ok()) {
            $data = $response->json();

            // Store in DB, keep only last 15 pricelists
            DB::table('pricelists')->insert([
                'data' => json_encode($data),
                'valid_until' => Carbon::parse($data['validUntil']),
                'created_at' => now(),
            ]);

            // Remove older pricelists
            DB::table('pricelists')
                ->orderBy('created_at', 'asc')
                ->skip(15)
                ->take(PHP_INT_MAX)
                ->delete();

            return response()->json($data);
        }

        return response()->json(['error' => 'Unable to fetch pricelists'], 500);
    }

    public function getStoredPricelists()
    {
        $pricelists = DB::table('pricelists')
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        return response()->json($pricelists);
    }

    public function store(Request $request)
    {
        // Validate and save the pricelist
        $data = $request->all();
        $pricelist = Pricelist::create($data);

        // Keep only the last 15 pricelists
        $totalPricelists = Pricelist::count();

        if ($totalPricelists > 15) {
            // Delete the oldest pricelist
            Pricelist::orderBy('created_at')->first()->delete();
        }

        return response()->json(['message' => 'Pricelist stored successfully']);
    }
}

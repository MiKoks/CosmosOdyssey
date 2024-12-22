<?php
// app/Http/Controllers/PricelistController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class PricelistController extends Controller
{
    public function fetchActivePricelists()
    {
        $response = Http::withOptions(['verify' => false])
            ->get('https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices');

        if ($response->ok()) {
            $data = $response->json();

            // Check if the pricelist already exists in the database
            $existingPricelist = DB::table('pricelists')
                ->where('valid_until', Carbon::parse($data['validUntil']))
                ->first();

            if (!$existingPricelist) {
                // Insert only if it's not a duplicate
                DB::table('pricelists')->insert([
                    'data' => json_encode($data),
                    'valid_until' => Carbon::parse($data['validUntil']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Keep only the last 15 pricelists
                $count = DB::table('pricelists')->count();
                if ($count > 15) {
                    $excess = $count - 15;
                    DB::table('pricelists')
                        ->orderBy('created_at', 'asc')
                        ->limit($excess)
                        ->delete();
                }
            }

            // Always fetch the latest active pricelist
            $activePricelist = DB::table('pricelists')
                ->where('valid_until', '>', now())
                ->orderBy('created_at', 'desc')
                ->first();

            if ($activePricelist) {
                $companies = collect(json_decode($activePricelist->data, true)['legs'] ?? [])
                    ->flatMap(function ($leg) {
                        return collect($leg['providers'])->pluck('company.name');
                    })
                    ->unique()
                    ->values();

                return response()->json([
                    'pricelist' => json_decode($activePricelist->data),
                    'companies' => $companies,
                ]);

            }
        }

        // If no pricelist is active or available
        return response()->json(['error' => 'No active pricelist found'], 404);
    }




    // Method to return routes after processing
    public function findRoutes(Request $request, \App\Services\RouteFinderService $routeFinder)
    {
        try {
            $validated = $request->validate([
                'origin' => 'required|string',
                'destination' => 'required|string',
                'company' => 'nullable|string',
                'sortKey' => 'nullable|in:price,distance,travelTime',
                'sortOrder' => 'nullable|in:asc,desc'
            ]);

            $origin = $validated['origin'];
            $destination = $validated['destination'];
            $company = $validated['company'] ?? null;
            $sortKey = $validated['sortKey'] ?? null;
            $sortOrder = $validated['sortOrder'] ?? 'asc';

            $routes = $routeFinder->findRoutes($origin, $destination, $company, $sortKey, $sortOrder);

            return response()->json($routes);
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLatestPricelist()
{
    $activePricelist = DB::table('pricelists')
        ->where('valid_until', '>', now())
        ->orderBy('created_at', 'desc')
        ->first();
    if ($activePricelist) {
        return response()->json([
            'pricelist' => json_decode($activePricelist->data)
        ]);
    }
    return response()->json(['error' => 'No active pricelist found'], 404);
}

}

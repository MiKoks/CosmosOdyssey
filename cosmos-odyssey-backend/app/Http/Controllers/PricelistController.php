<?php

namespace App\Http\Controllers;

use App\Services\PricelistService;
use App\Services\RouteFinderService;
use Illuminate\Http\Request;

class PricelistController extends Controller
{
    protected $pricelistService;

    public function __construct(PricelistService $pricelistService)
    {
        $this->pricelistService = $pricelistService;
    }

    public function fetchActivePricelists()
    {
        $success = $this->pricelistService->fetchAndStorePricelist();

        if (!$success) {
            return response()->json(['error' => 'Failed to fetch pricelist'], 500);
        }

        $activePricelist = $this->pricelistService->getActivePricelist();

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

        return response()->json(['error' => 'No active pricelist found'], 404);
    }

    public function findRoutes(Request $request, RouteFinderService $routeFinder)
    {
        try {
            $validated = $request->validate([
                'origin' => 'required|string',
                'destination' => 'required|string',
                'company' => 'nullable|string',
                'sortKey' => 'nullable|in:price,distance,travelTime',
                'sortOrder' => 'nullable|in:asc,desc'
            ]);

            $routes = $routeFinder->findRoutes(
                $validated['origin'],
                $validated['destination'],
                $validated['company'] ?? null,
                $validated['sortKey'] ?? null,
                $validated['sortOrder'] ?? 'asc'
            );

            return response()->json($routes);
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLatestPricelist()
    {
        $activePricelist = $this->pricelistService->getActivePricelist();

        if ($activePricelist) {
            return response()->json([
                'pricelist' => json_decode($activePricelist->data)
            ]);
        }

        return response()->json(['error' => 'No active pricelist found'], 404);
    }

    public function getAllPricelists()
    {
        $pricelists = $this->pricelistService->getAllPricelists();

        return response()->json($pricelists);
    }
}

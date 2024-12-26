<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class PricelistService
{
    public function fetchAndStorePricelist()
    {
        $data = $this->fetchPricelistFromApi();

        if (!$data) {
            return false;
        }

        $existingPricelist = DB::table('pricelists')
            ->where('valid_until', Carbon::parse($data['validUntil']))
            ->first();

        if (!$existingPricelist) {
            $this->insertPricelist($data);
            $this->deleteObsoletePricelists();
        }

        return true;
    }

    public function fetchPricelistFromApi()
    {
        $response = Http::withOptions(['verify' => false])
            ->get('https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices');

        return $response->ok() ? $response->json() : null;
    }

    public function insertPricelist($data)
    {
        DB::table('pricelists')->insert([
            'data' => json_encode($data),
            'valid_until' => Carbon::parse($data['validUntil']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function deleteObsoletePricelists()
    {
        $count = DB::table('pricelists')->count();

        if ($count > 15) {
            $excess = $count - 15;

            $obsoletePricelists = DB::table('pricelists')
                ->orderBy('created_at', 'asc')
                ->limit($excess)
                ->pluck('id');

            DB::table('pricelists')
                ->whereIn('id', $obsoletePricelists)
                ->delete();

            DB::table('reservations')
                ->whereIn('pricelist_id', $obsoletePricelists)
                ->delete();
        }
    }

    public function getActivePricelist()
    {
        return DB::table('pricelists')
            ->where('valid_until', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();
    }

    public function getAllPricelists()
    {
        return DB::table('pricelists')
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get()
            ->map(function ($pricelist) {
                return [
                    'id' => $pricelist->id,
                    'valid_until' => $pricelist->valid_until,
                    'created_at' => $pricelist->created_at,
                    'updated_at' => $pricelist->updated_at,
                    'legs' => json_decode($pricelist->data, true)['legs'] ?? [],
                ];
            });
    }
}

<?php

namespace App\Services;

use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    public function createReservation(array $data)
    {
        return Reservation::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'routes' => json_encode($data['routes']),
            'total_price' => $data['total_price'],
            'total_travel_time' => $data['total_travel_time'],
            'company_names' => json_encode($data['company_names']),
            'pricelist_id' => $data['pricelist_id'],
        ]);
    }

    public function getAllReservations()
    {
        return DB::table('reservations')->get();
    }
}

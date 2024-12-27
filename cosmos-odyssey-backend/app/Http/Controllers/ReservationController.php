<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ReservationService;
use App\Models\Pricelist;

class ReservationController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function store(Request $request)
    {
        \Log::info('Request Data:', $request->all());

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'routes' => 'required|array',
            'total_price' => 'required|numeric',
            'total_travel_time' => 'required|numeric',
            'company_names' => 'required|array',
            'pricelist_id' => [
                'required',
                'integer',
                'exists:pricelists,id',
                function ($attribute, $value, $fail) {
                    $pricelist = Pricelist::where('id', $value)
                        ->where('valid_until', '>', now()) // Ensure pricelist is still valid
                        ->first();

                    if (!$pricelist) {
                        $fail('The selected pricelist is invalid or expired.');
                    }
                },
            ],
        ]);

        $reservation = $this->reservationService->createReservation($validated);

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation,
        ], 201);
    }

    public function index()
    {
        $reservations = $this->reservationService->getAllReservations();
        return response()->json($reservations);
    }
}

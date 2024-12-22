<?php
// app/Http/Controllers/ReservationController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Request Data:', $request->all());
        $validated = $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'routeId' => 'required|string',
            'totalPrice' => 'required|numeric',
            'travelTime' => 'required|numeric',
        ]);

        // Get the latest active pricelist
        $activePricelist = DB::table('pricelists')
            ->where('valid_until', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$activePricelist) {
            return response()->json(['error' => 'No active pricelist available'], 400);
        }

        $reservation = Reservation::create([
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'routes' => json_encode([
                'id' => $validated['routeId'],
                'details' => 'Route details can be included here'
            ]),
            'total_price' => $validated['totalPrice'],
            'total_travel_time' => $validated['travelTime'],
            'company_names' => json_encode(['company' => 'Spacelux']), // Example
            'pricelist_id' => $activePricelist->id
        ]);

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation,
        ], 201);
    }

    public function index()
    {
        $reservations = DB::table('reservations')->get();
        return response()->json($reservations);
    }
}

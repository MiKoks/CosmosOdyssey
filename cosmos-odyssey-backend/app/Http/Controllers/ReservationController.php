<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Reservation;


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

    // Save the reservation to the database
    $reservation = Reservation::create([
        'first_name' => $validated['firstName'],
        'last_name' => $validated['lastName'],
        'routes' => json_encode([ // Convert routeId into a JSON structure
            'id' => $validated['routeId'],
            'details' => 'Route details can be included here'
        ]),
        'total_price' => $validated['totalPrice'],
        'total_travel_time' => $validated['travelTime'],
        'company_names' => json_encode(['company' => 'Spacelux']), // Example JSON structure for companies
    ]);
    

    // Return a success response
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

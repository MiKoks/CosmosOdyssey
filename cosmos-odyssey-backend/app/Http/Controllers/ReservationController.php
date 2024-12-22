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
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'routes' => 'required|array',
            'total_price' => 'required|numeric',
            'total_travel_time' => 'required|numeric',
            'company_names' => 'required|array',
            'pricelist_id' => 'required|integer|exists:pricelists,id', 
        ]);

        $reservation = Reservation::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'routes' => json_encode($validated['routes']),
            'total_price' => $validated['total_price'],
            'total_travel_time' => $validated['total_travel_time'],
            'company_names' => json_encode($validated['company_names']),
            'pricelist_id' => $validated['pricelist_id'],
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

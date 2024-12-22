<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PricelistController;

Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/findRoutes', [PricelistController::class, 'findRoutes']);
Route::get('/storeLatestPricelist', [PricelistController::class, 'fetchActivePricelists']);
Route::get('/latest-pricelist', [PricelistController::class, 'getLatestPricelist']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});



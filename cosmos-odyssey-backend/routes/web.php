<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PricelistController;
use App\Http\Controllers\ReservationController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {return view('welcome');});
Route::get('/api/pricelists', [PricelistController::class, 'fetchActivePricelists']);
Route::get('/api/pricelists/history', [PricelistController::class, 'getStoredPricelists']);
Route::post('/api/reservations', [ReservationController::class, 'store']);
Route::get('/api/reservations', [ReservationController::class, 'index']);


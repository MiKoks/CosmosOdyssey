<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pricelist extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::deleting(function ($pricelist) {
            DB::table('reservations')
                ->where('pricelist_id', $pricelist->id)
                ->delete();
        });
    }
}

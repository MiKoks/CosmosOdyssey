<?php

class Pricelist extends Model
{
    protected static function booted()
    {
        static::deleting(function ($pricelist) {
            DB::table('reservations')
                ->where('routeId', $pricelist->id)
                ->delete();
        });
    }
}

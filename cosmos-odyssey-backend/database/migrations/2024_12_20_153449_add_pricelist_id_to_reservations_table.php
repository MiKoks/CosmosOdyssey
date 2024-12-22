<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->json('routes');
            $table->decimal('total_price', 10, 2);
            $table->integer('total_travel_time');
            $table->json('company_names');
            $table->unsignedBigInteger('pricelist_id');
            $table->timestamps();

            $table->foreign('pricelist_id')
                  ->references('id')->on('pricelists')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('reservations', function (Blueprint $table) {
            //
        });
    }
};

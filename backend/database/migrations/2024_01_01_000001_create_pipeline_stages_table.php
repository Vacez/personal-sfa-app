<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pipeline_stages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('mode', 32); // B2B_CONSULTING, VIP_HOSPITALITY
            $table->string('name', 128);
            $table->integer('sort_order')->default(0);
            $table->integer('win_probability_rate')->default(50); // 10, 30, 60, 90, 100
            $table->boolean('is_system_default')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pipeline_stages');
    }
};

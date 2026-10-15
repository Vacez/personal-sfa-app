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
        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('name', 255);
            $table->string('display_name', 255)->nullable();
            $table->string('contact_mode', 32); // B2B_CONSULTING, VIP_HOSPITALITY
            $table->string('phone', 64)->nullable();
            $table->string('sns_account', 128)->nullable();
            $table->date('birthday')->nullable();
            $table->decimal('expected_amount', 12, 2)->default(0.00);
            $table->decimal('lifetime_sales_amount', 12, 2)->default(0.00);
            $table->json('custom_attributes')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->uuid('current_stage_id')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('current_stage_id')->references('id')->on('pipeline_stages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};

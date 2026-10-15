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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('contact_id')->nullable();
            $table->uuid('attributed_social_post_id')->nullable();
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->string('payment_method', 32); // CASH, CREDIT_CARD, RECEIVABLE
            $table->boolean('is_settled')->default(false);
            $table->string('sync_status', 32)->default('PENDING'); // PENDING, SYNCED, FAILED
            $table->date('transaction_date');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('set null');
            $table->foreign('attributed_social_post_id')->references('id')->on('social_posts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

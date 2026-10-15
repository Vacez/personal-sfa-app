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
        Schema::create('interaction_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('contact_id');
            $table->uuid('template_id')->nullable();
            $table->string('channel', 32); // LINE, INSTAGRAM_DM, EMAIL, PHONE, IN_PERSON
            $table->text('notes')->nullable();
            $table->timestamp('interacted_at')->useCurrent();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('message_templates')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interaction_logs');
    }
};

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
        Schema::create('social_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('social_account_id');
            $table->string('external_post_id', 128);
            $table->text('post_url')->nullable();
            $table->text('caption')->nullable();
            $table->timestamp('posted_at');
            $table->integer('impressions_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->decimal('attributed_sales_amount', 12, 2)->default(0.00);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('social_account_id')->references('id')->on('social_accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_posts');
    }
};

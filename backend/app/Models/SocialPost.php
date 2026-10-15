<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialPost extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'social_account_id',
        'external_post_id',
        'post_url',
        'caption',
        'posted_at',
        'impressions_count',
        'likes_count',
        'attributed_sales_amount',
    ];

    protected $casts = [
        'posted_at' => 'datetime',
        'impressions_count' => 'integer',
        'likes_count' => 'integer',
        'attributed_sales_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function socialAccount(): BelongsTo
    {
        return $this->belongsTo(SocialAccount::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'attributed_social_post_id');
    }
}

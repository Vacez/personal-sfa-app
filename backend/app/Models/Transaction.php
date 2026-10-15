<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'contact_id',
        'attributed_social_post_id',
        'amount',
        'payment_method',
        'is_settled',
        'sync_status',
        'transaction_date',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_settled' => 'boolean',
        'transaction_date' => 'date:Y-m-d',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function attributedSocialPost(): BelongsTo
    {
        return $this->belongsTo(SocialPost::class, 'attributed_social_post_id');
    }
}

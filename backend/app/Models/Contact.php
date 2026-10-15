<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'display_name',
        'contact_mode',
        'phone',
        'sns_account',
        'birthday',
        'expected_amount',
        'lifetime_sales_amount',
        'custom_attributes',
        'last_contacted_at',
        'current_stage_id',
    ];

    protected $casts = [
        'birthday' => 'date:Y-m-d',
        'expected_amount' => 'decimal:2',
        'lifetime_sales_amount' => 'decimal:2',
        'custom_attributes' => 'array',
        'last_contacted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'current_stage_id');
    }

    public function interactionLogs(): HasMany
    {
        return $this->hasMany(InteractionLog::class)->orderBy('interacted_at', 'desc');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class)->orderBy('transaction_date', 'desc');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'mode',
        'used_count',
        'converted_count',
    ];

    protected $casts = [
        'used_count' => 'integer',
        'converted_count' => 'integer',
    ];

    protected $appends = [
        'cvr_percentage',
    ];

    public function getCvrPercentageAttribute(): float
    {
        if ($this->used_count <= 0) {
            return 0.0;
        }
        return round(($this->converted_count / $this->used_count) * 100, 1);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interactionLogs(): HasMany
    {
        return $this->hasMany(InteractionLog::class, 'template_id');
    }
}

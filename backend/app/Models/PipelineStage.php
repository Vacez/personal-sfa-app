<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PipelineStage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'mode',
        'name',
        'sort_order',
        'win_probability_rate',
        'is_system_default',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'win_probability_rate' => 'integer',
        'is_system_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'current_stage_id');
    }
}

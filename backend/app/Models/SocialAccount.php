<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialAccount extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'platform',
        'account_username',
        'access_token',
        'token_expires_at',
        'is_active',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(SocialPost::class);
    }
}

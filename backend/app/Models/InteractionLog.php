<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InteractionLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'contact_id',
        'template_id',
        'channel',
        'notes',
        'interacted_at',
    ];

    protected $casts = [
        'interacted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class, 'template_id');
    }
}

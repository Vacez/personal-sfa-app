<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'default_mode',
        'monthly_sales_quota',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'monthly_sales_quota' => 'decimal:2',
    ];

    public function pipelineStages(): HasMany
    {
        return $this->hasMany(PipelineStage::class)->orderBy('sort_order');
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class)->orderBy('posted_at', 'desc');
    }

    public function messageTemplates(): HasMany
    {
        return $this->hasMany(MessageTemplate::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function interactionLogs(): HasMany
    {
        return $this->hasMany(InteractionLog::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class)->orderBy('transaction_date', 'desc');
    }
}

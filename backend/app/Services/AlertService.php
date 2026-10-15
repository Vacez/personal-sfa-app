<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\User;
use Carbon\Carbon;

class AlertService
{
    /**
     * Get high-priority action alerts:
     * 1. Birthdays today
     * 2. Inactive clients (> 14 days without contact)
     * 3. Stalled deals (> 7 days without progress)
     */
    public function getActionAlerts(User $user): array
    {
        $now = Carbon::now();
        $fourteenDaysAgo = $now->copy()->subDays(14);
        $sevenDaysAgo = $now->copy()->subDays(7);

        // 1. Birthdays today
        $birthdays = Contact::with('stage')
            ->where('user_id', $user->id)
            ->whereNotNull('birthday')
            ->whereMonth('birthday', $now->month)
            ->whereDay('birthday', $now->day)
            ->orderBy('lifetime_sales_amount', 'desc')
            ->get();

        // 2. Inactive clients (>14 days without contact), prioritized by LTV
        $inactiveClients = Contact::with('stage')
            ->where('user_id', $user->id)
            ->where(function ($query) use ($fourteenDaysAgo) {
                $query->whereNull('last_contacted_at')
                      ->orWhere('last_contacted_at', '<=', $fourteenDaysAgo);
            })
            ->orderBy('lifetime_sales_amount', 'desc')
            ->limit(10)
            ->get();

        // 3. Stalled deals (>7 days in current stage without interaction)
        $stalledDeals = Contact::with('stage')
            ->where('user_id', $user->id)
            ->whereNotNull('current_stage_id')
            ->whereHas('stage', function ($q) {
                $q->whereBetween('win_probability_rate', [1, 99]); // active in pipeline
            })
            ->where(function ($query) use ($sevenDaysAgo) {
                $query->whereNull('last_contacted_at')
                      ->orWhere('last_contacted_at', '<=', $sevenDaysAgo);
            })
            ->orderBy('expected_amount', 'desc')
            ->limit(10)
            ->get();

        return [
            'birthdays' => $birthdays,
            'inactive_clients' => $inactiveClients,
            'stalled_deals' => $stalledDeals,
            'summary' => [
                'total_alerts' => $birthdays->count() + $inactiveClients->count() + $stalledDeals->count(),
                'birthdays_count' => $birthdays->count(),
                'inactive_count' => $inactiveClients->count(),
                'stalled_count' => $stalledDeals->count(),
            ]
        ];
    }
}

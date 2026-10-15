<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ForecastService
{
    /**
     * Calculate monthly quota, confirmed sales, and weighted pipeline forecast.
     */
    public function getMonthlyForecast(User $user, ?Carbon $month = null): array
    {
        $targetMonth = $month ?? Carbon::now();
        $startOfMonth = $targetMonth->copy()->startOfMonth();
        $endOfMonth = $targetMonth->copy()->endOfMonth();

        $quota = (float) $user->monthly_sales_quota;

        // Confirmed sales within the month
        $confirmedSales = (float) Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->sum('amount');

        // Weighted pipeline forecast
        // SUM(contacts.expected_amount * (pipeline_stages.win_probability_rate / 100.0))
        $weightedPipeline = (float) Contact::where('contacts.user_id', $user->id)
            ->whereNotNull('contacts.current_stage_id')
            ->where('contacts.expected_amount', '>', 0)
            ->join('pipeline_stages', 'contacts.current_stage_id', '=', 'pipeline_stages.id')
            ->selectRaw('SUM(contacts.expected_amount * (pipeline_stages.win_probability_rate / 100.0)) as weighted_total')
            ->value('weighted_total') ?? 0.0;

        $projectedFinish = round($confirmedSales + $weightedPipeline, 2);
        $pacingPercentage = $quota > 0 ? round(($projectedFinish / $quota) * 100, 1) : 0.0;
        $confirmedPercentage = $quota > 0 ? round(($confirmedSales / $quota) * 100, 1) : 0.0;

        return [
            'quota' => $quota,
            'confirmed_sales' => round($confirmedSales, 2),
            'weighted_forecast' => round($weightedPipeline, 2),
            'projected_finish' => $projectedFinish,
            'pacing_percentage' => $pacingPercentage,
            'confirmed_percentage' => $confirmedPercentage,
            'month' => $targetMonth->format('Y-m'),
        ];
    }
}

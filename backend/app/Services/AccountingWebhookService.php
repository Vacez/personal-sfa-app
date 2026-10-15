<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AccountingWebhookService
{
    /**
     * Dispatch outbound anonymized accounting webhook.
     */
    public function dispatchTransactionWebhook(Transaction $transaction, string $event = 'transaction.created'): bool
    {
        $webhookUrl = config('services.accounting.webhook_url');

        // Generate anonymized reference hash without client PII
        $anonymizedRef = 'anon_ref_' . substr(hash('sha256', ($transaction->contact_id ?? 'direct') . config('app.key')), 0, 10);

        $payload = [
            'event' => $event,
            'transaction_id' => $transaction->id,
            'user_id' => $transaction->user_id,
            'occurred_at' => $transaction->created_at ? $transaction->created_at->toIso8601String() : now()->toIso8601String(),
            'mode' => $transaction->user->default_mode ?? 'VIP_HOSPITALITY',
            'amount' => (float) $transaction->amount,
            'currency' => config('services.accounting.currency', 'JPY'),
            'payment_method' => $transaction->payment_method,
            'is_settled' => (bool) $transaction->is_settled,
            'tax_category' => 'STANDARD_10',
            'reference_id' => $anonymizedRef,
        ];

        Log::info('Accounting webhook dispatched (PII-free payload):', $payload);

        // If no webhook URL configured, we log and mark synced in local/mock mode
        if (empty($webhookUrl)) {
            $transaction->sync_status = 'SYNCED';
            $transaction->save();
            return true;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'X-Accounting-Signature' => hash_hmac('sha256', json_encode($payload), config('services.accounting.secret', 'default_secret')),
                    'Content-Type' => 'application/json',
                ])
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                $transaction->sync_status = 'SYNCED';
                $transaction->save();
                return true;
            } else {
                Log::warning('Accounting webhook failed with status ' . $response->status());
                $transaction->sync_status = 'FAILED';
                $transaction->save();
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Accounting webhook network exception: ' . $e->getMessage());
            $transaction->sync_status = 'FAILED';
            $transaction->save();
            return false;
        }
    }
}

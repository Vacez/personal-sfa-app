<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\SocialPost;
use App\Models\Transaction;
use App\Services\AccountingWebhookService;
use App\Services\SocialSyncService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected SocialSyncService $socialSyncService;
    protected AccountingWebhookService $accountingWebhookService;

    public function __construct(
        SocialSyncService $socialSyncService,
        AccountingWebhookService $accountingWebhookService
    ) {
        $this->socialSyncService = $socialSyncService;
        $this->accountingWebhookService = $accountingWebhookService;
    }

    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with(['contact', 'attributedSocialPost'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'contact_id' => 'required|uuid|exists:contacts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:CASH,CREDIT_CARD,RECEIVABLE',
            'transaction_date' => 'required|date',
            'attributed_social_post_id' => 'nullable|uuid|exists:social_posts,id',
            'is_settled' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ]);

        $contact = Contact::where('user_id', $user->id)->findOrFail($validated['contact_id']);
        $transactionDate = Carbon::parse($validated['transaction_date']);

        // Zero-touch Social Attribution:
        // If not manually specified, auto-search for recent social post within 48h
        $postId = $validated['attributed_social_post_id'] ?? null;
        if (empty($postId)) {
            $candidatePost = $this->socialSyncService->findAttributionCandidate($user, $transactionDate);
            if ($candidatePost) {
                $postId = $candidatePost->id;
            }
        }

        $isSettled = $validated['payment_method'] === 'RECEIVABLE'
            ? ($validated['is_settled'] ?? false)
            : true;

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'contact_id' => $contact->id,
            'attributed_social_post_id' => $postId,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'is_settled' => $isSettled,
            'sync_status' => 'PENDING',
            'transaction_date' => $transactionDate->toDateString(),
            'metadata' => $validated['metadata'] ?? null,
        ]);

        // Increment contact's lifetime sales
        $contact->lifetime_sales_amount = (float) $contact->lifetime_sales_amount + (float) $validated['amount'];
        $contact->last_contacted_at = Carbon::now();
        $contact->save();

        // Increment attributed sales amount on social post
        if ($postId) {
            $post = SocialPost::find($postId);
            if ($post) {
                $this->socialSyncService->attributeRevenue($post, (float) $validated['amount']);
            }
        }

        // Dispatch outbound accounting webhook (anonymized PII-free)
        $this->accountingWebhookService->dispatchTransactionWebhook($transaction);

        return response()->json([
            'message' => 'Transaction recorded successfully',
            'transaction' => $transaction->load(['contact', 'attributedSocialPost']),
        ], 201);
    }

    public function settle(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        $transaction->is_settled = true;
        $transaction->save();

        // Dispatch settlement webhook event
        $this->accountingWebhookService->dispatchTransactionWebhook($transaction, 'transaction.settled');

        return response()->json([
            'message' => 'Receivable settled successfully',
            'transaction' => $transaction->load(['contact', 'attributedSocialPost']),
        ]);
    }
}

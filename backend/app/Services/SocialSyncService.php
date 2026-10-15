<?php

namespace App\Services;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Models\User;
use App\Services\Social\MetaGraphApiAdapter;
use App\Services\Social\MockSocialAdapter;
use App\Services\Social\SocialSyncAdapterInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SocialSyncService
{
    protected MockSocialAdapter $mockAdapter;
    protected MetaGraphApiAdapter $metaAdapter;

    public function __construct(
        MockSocialAdapter $mockAdapter,
        MetaGraphApiAdapter $metaAdapter
    ) {
        $this->mockAdapter = $mockAdapter;
        $this->metaAdapter = $metaAdapter;
    }

    /**
     * Choose appropriate adapter based on environment and account token.
     */
    public function getAdapter(SocialAccount $account, bool $forceMock = false): SocialSyncAdapterInterface
    {
        if ($forceMock || config('services.meta.use_mock', true) || empty($account->access_token) || $account->access_token === 'mock_token') {
            return $this->mockAdapter;
        }

        return $this->metaAdapter;
    }

    /**
     * Sync social account posts into database.
     */
    public function syncAccount(SocialAccount $account, bool $forceMock = false): array
    {
        $adapter = $this->getAdapter($account, $forceMock);
        $postsData = $adapter->fetchPosts($account);
        $syncedPosts = [];

        foreach ($postsData as $postItem) {
            $post = SocialPost::updateOrCreate(
                [
                    'user_id' => $account->user_id,
                    'external_post_id' => $postItem['external_post_id'],
                ],
                [
                    'social_account_id' => $account->id,
                    'post_url' => $postItem['post_url'],
                    'caption' => $postItem['caption'],
                    'posted_at' => Carbon::parse($postItem['posted_at']),
                    'impressions_count' => $postItem['impressions_count'],
                    'likes_count' => $postItem['likes_count'],
                ]
            );

            $syncedPosts[] = $post;
        }

        return $syncedPosts;
    }

    /**
     * Engine 1: Automatically find most recent post within 24-48 hours before transaction date.
     */
    public function findAttributionCandidate(User $user, Carbon $transactionDate): ?SocialPost
    {
        $windowStart = $transactionDate->copy()->subHours(48);
        $windowEnd = $transactionDate->copy()->endOfDay();

        return SocialPost::where('user_id', $user->id)
            ->whereBetween('posted_at', [$windowStart, $windowEnd])
            ->orderBy('posted_at', 'desc')
            ->first();
    }

    /**
     * Add revenue attribution to post.
     */
    public function attributeRevenue(SocialPost $post, float $amount): void
    {
        $post->attributed_sales_amount = (float) $post->attributed_sales_amount + $amount;
        $post->save();
    }
}

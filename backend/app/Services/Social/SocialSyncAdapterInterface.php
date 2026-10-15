<?php

namespace App\Services\Social;

use App\Models\SocialAccount;

interface SocialSyncAdapterInterface
{
    /**
     * Fetch recent posts from platform.
     *
     * @return array<int, array{
     *     external_post_id: string,
     *     post_url: ?string,
     *     caption: ?string,
     *     posted_at: string,
     *     impressions_count: int,
     *     likes_count: int
     * }>
     */
    public function fetchPosts(SocialAccount $account): array;
}

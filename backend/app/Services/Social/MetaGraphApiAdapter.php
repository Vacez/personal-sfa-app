<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaGraphApiAdapter implements SocialSyncAdapterInterface
{
    protected string $graphApiVersion;
    protected string $baseUrl;

    public function __construct()
    {
        $this->graphApiVersion = config('services.meta.graph_version', 'v19.0');
        $this->baseUrl = "https://graph.facebook.com/{$this->graphApiVersion}";
    }

    /**
     * Fetch real posts from Instagram Graph API.
     * Required Meta permissions: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`
     */
    public function fetchPosts(SocialAccount $account): array
    {
        if (empty($account->access_token) || $account->access_token === 'mock_token') {
            throw new Exception('Meta Graph API requires a valid Long-Lived User Access Token.');
        }

        try {
            // 1. Get Instagram Business Account Media list
            // GET /{ig-user-id}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count
            $response = Http::timeout(10)->get("{$this->baseUrl}/{$account->account_username}/media", [
                'access_token' => $account->access_token,
                'fields' => 'id,caption,permalink,timestamp,like_count,insights.metric(impressions,reach)',
                'limit' => 20,
            ]);

            if ($response->failed()) {
                Log::warning('Meta Graph API request failed', [
                    'account_id' => $account->id,
                    'status' => $response->status(),
                    'error' => $response->json(),
                ]);
                throw new Exception('Meta Graph API error: ' . ($response->json('error.message') ?? 'Unknown error'));
            }

            $data = $response->json('data', []);
            $formatted = [];

            foreach ($data as $item) {
                $impressions = 0;
                if (!empty($item['insights']['data'])) {
                    foreach ($item['insights']['data'] as $metric) {
                        if (($metric['name'] ?? '') === 'impressions') {
                            $impressions = (int) ($metric['values'][0]['value'] ?? 0);
                        }
                    }
                }

                $formatted[] = [
                    'external_post_id' => $item['id'],
                    'post_url' => $item['permalink'] ?? null,
                    'caption' => $item['caption'] ?? null,
                    'posted_at' => $item['timestamp'],
                    'impressions_count' => $impressions,
                    'likes_count' => (int) ($item['like_count'] ?? 0),
                ];
            }

            return $formatted;
        } catch (Exception $e) {
            Log::error('Meta Graph API Adapter Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}

<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Carbon\Carbon;

class MockSocialAdapter implements SocialSyncAdapterInterface
{
    public function fetchPosts(SocialAccount $account): array
    {
        $now = Carbon::now();

        if ($account->platform === 'INSTAGRAM') {
            return [
                [
                    'external_post_id' => 'ig_post_' . $now->copy()->subHours(18)->timestamp,
                    'post_url' => 'https://instagram.com/p/C_Autumn_Salon_VIP',
                    'caption' => '秋の限定サロンセッション 🍾 週末の特別VIP枠をご案内中。プライベートラウンジでお待ちしております。 #VIPHospitality #AutumnLounge',
                    'posted_at' => $now->copy()->subHours(18)->toDateTimeString(),
                    'impressions_count' => 3840,
                    'likes_count' => 412,
                ],
                [
                    'external_post_id' => 'ig_post_' . $now->copy()->subDays(2)->timestamp,
                    'post_url' => 'https://instagram.com/p/C_Client_Success_Story',
                    'caption' => '今月も大切なクライアント様との素晴らしいディナーミーティング。信頼を形にするパートナーシップに感謝です。 ✨ #ClientRelations #ServiceExcellence',
                    'posted_at' => $now->copy()->subDays(2)->toDateTimeString(),
                    'impressions_count' => 5200,
                    'likes_count' => 670,
                ],
                [
                    'external_post_id' => 'ig_post_' . $now->copy()->subDays(5)->timestamp,
                    'post_url' => 'https://instagram.com/p/C_Weekend_Lounge_Prep',
                    'caption' => '今宵も最高のおもてなしをご用意。特別なヴィンテージシャンパーニュが入荷しました 🥂 #Omotenashi #TokyoNight',
                    'posted_at' => $now->copy()->subDays(5)->toDateTimeString(),
                    'impressions_count' => 4100,
                    'likes_count' => 385,
                ],
            ];
        }

        // X_TWITTER
        return [
            [
                'external_post_id' => 'x_tweet_' . $now->copy()->subHours(24)->timestamp,
                'post_url' => 'https://x.com/sfa_pro/status/1830000000',
                'caption' => '【B2B案件獲得の現場】提案から契約締結までのリードタイムを半分にする「事前合意形成」の3ステップをまとめました。DMでの壁打ち相談も歓迎です。',
                'posted_at' => $now->copy()->subHours(24)->toDateTimeString(),
                'impressions_count' => 12400,
                'likes_count' => 280,
            ],
            [
                'external_post_id' => 'x_tweet_' . $now->copy()->subDays(3)->timestamp,
                'post_url' => 'https://x.com/sfa_pro/status/1829000000',
                'caption' => '成果を出すコンサルティングの秘訣は「契約後の初動72時間」にある。期待値調整を徹底することで紹介率が3倍に跳ね上がる。',
                'posted_at' => $now->copy()->subDays(3)->toDateTimeString(),
                'impressions_count' => 8900,
                'likes_count' => 195,
            ]
        ];
    }
}

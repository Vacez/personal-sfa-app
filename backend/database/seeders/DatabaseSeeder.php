<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\InteractionLog;
use App\Models\MessageTemplate;
use App\Models\PipelineStage;
use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Create Default User
        $user = User::create([
            'name' => 'Kenji Takahashi',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '+81 90-1234-5678',
            'default_mode' => 'VIP_HOSPITALITY',
            'monthly_sales_quota' => 1000000.00,
        ]);

        // 2. Pipeline Stages for VIP_HOSPITALITY
        $vipStages = [
            'inquiry' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'VIP_HOSPITALITY',
                'name' => 'First Visit / Inquiry',
                'sort_order' => 1,
                'win_probability_rate' => 20,
                'is_system_default' => true,
            ]),
            'hook' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'VIP_HOSPITALITY',
                'name' => 'Second Visit Hook',
                'sort_order' => 2,
                'win_probability_rate' => 45,
                'is_system_default' => true,
            ]),
            'regular' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'VIP_HOSPITALITY',
                'name' => 'Regular Patron',
                'sort_order' => 3,
                'win_probability_rate' => 75,
                'is_system_default' => true,
            ]),
            'champion' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'VIP_HOSPITALITY',
                'name' => 'VIP Champion',
                'sort_order' => 4,
                'win_probability_rate' => 95,
                'is_system_default' => true,
            ]),
        ];

        // 3. Pipeline Stages for B2B_CONSULTING
        $b2bStages = [
            'lead' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'name' => 'Lead Inbound',
                'sort_order' => 1,
                'win_probability_rate' => 15,
                'is_system_default' => true,
            ]),
            'discovery' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'name' => 'Discovery Call',
                'sort_order' => 2,
                'win_probability_rate' => 35,
                'is_system_default' => true,
            ]),
            'proposal' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'name' => 'Proposal Sent',
                'sort_order' => 3,
                'win_probability_rate' => 60,
                'is_system_default' => true,
            ]),
            'final' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'name' => 'Contract Finalization',
                'sort_order' => 4,
                'win_probability_rate' => 90,
                'is_system_default' => true,
            ]),
            'won' => PipelineStage::create([
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'name' => 'Closed Won',
                'sort_order' => 5,
                'win_probability_rate' => 100,
                'is_system_default' => true,
            ]),
        ];

        // 4. Social Accounts & Posts
        $igAccount = SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'INSTAGRAM',
            'account_username' => 'vip_omotenashi_tokyo',
            'access_token' => 'mock_token',
            'is_active' => true,
        ]);

        $xAccount = SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'X_TWITTER',
            'account_username' => 'sfa_advisory_jp',
            'access_token' => 'mock_token',
            'is_active' => true,
        ]);

        $post1 = SocialPost::create([
            'user_id' => $user->id,
            'social_account_id' => $igAccount->id,
            'external_post_id' => 'ig_autumn_2026',
            'post_url' => 'https://instagram.com/p/C_Autumn_Salon_VIP',
            'caption' => '秋の限定サロンセッション 🍾 週末の特別VIP枠をご案内中。プライベートラウンジでお待ちしております。 #VIPHospitality #AutumnLounge',
            'posted_at' => $now->copy()->subHours(20),
            'impressions_count' => 3840,
            'likes_count' => 412,
            'attributed_sales_amount' => 450000.00,
        ]);

        $post2 = SocialPost::create([
            'user_id' => $user->id,
            'social_account_id' => $igAccount->id,
            'external_post_id' => 'ig_vintage_2026',
            'post_url' => 'https://instagram.com/p/C_Weekend_Lounge_Prep',
            'caption' => '今宵も最高のおもてなしをご用意。特別なヴィンテージシャンパーニュが入荷しました 🥂 #Omotenashi #TokyoNight',
            'posted_at' => $now->copy()->subDays(3),
            'impressions_count' => 4100,
            'likes_count' => 385,
            'attributed_sales_amount' => 170000.00,
        ]);

        $post3 = SocialPost::create([
            'user_id' => $user->id,
            'social_account_id' => $xAccount->id,
            'external_post_id' => 'x_lead_2026',
            'post_url' => 'https://x.com/sfa_pro/status/1830000000',
            'caption' => '【B2B案件獲得の現場】提案から契約締結までのリードタイムを半分にする「事前合意形成」の3ステップ。',
            'posted_at' => $now->copy()->subHours(36),
            'impressions_count' => 12400,
            'likes_count' => 280,
            'attributed_sales_amount' => 850000.00,
        ]);

        // 5. Message Templates
        $tplBirthday = MessageTemplate::create([
            'user_id' => $user->id,
            'title' => 'VIP Birthday Vintage Reserve Invitation',
            'content' => 'お誕生日おめでとうございます！特別な1年となりますよう心よりお祝い申し上げます。本日はお好みのヴィンテージシャンパンをご用意してお待ちしております🍾',
            'mode' => 'VIP_HOSPITALITY',
            'used_count' => 28,
            'converted_count' => 8, // 28.6% CVR
        ]);

        $tplWeekend = MessageTemplate::create([
            'user_id' => $user->id,
            'title' => 'Weekend Private Salon Lounge Open',
            'content' => '今週末のプライベートサロン枠が空きました。静かに寛ぎたい夜にぜひお立ち寄りください。お席をキープしておきます✨',
            'mode' => 'VIP_HOSPITALITY',
            'used_count' => 42,
            'converted_count' => 11, // 26.2% CVR
        ]);

        $tplB2BBrief = MessageTemplate::create([
            'user_id' => $user->id,
            'title' => 'B2B Post-Discovery Executive Brief',
            'content' => '先日はお時間をいただきありがとうございました。貴社の課題に合わせたロードマップ骨子とスコープ試算をまとめましたので共有いたします。',
            'mode' => 'B2B_CONSULTING',
            'used_count' => 15,
            'converted_count' => 6, // 40.0% CVR
        ]);

        // 6. Contacts (VIP Hospitality & B2B)
        // VIP Contact 1: Birthday Today, high LTV
        $c1 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Kenji Sato',
            'display_name' => 'Sato-CEO',
            'contact_mode' => 'VIP_HOSPITALITY',
            'phone' => '+81 90-8888-0001',
            'sns_account' => '@kenji_sato_exec',
            'birthday' => $now->toDateString(), // Birthday TODAY!
            'expected_amount' => 300000.00,
            'lifetime_sales_amount' => 3450000.00,
            'custom_attributes' => [
                'preferred_drink' => 'Dom Pérignon 2012',
                'seating' => 'Private VIP Booth A',
                'vip_tier' => 'Platinum Black',
            ],
            'last_contacted_at' => $now->copy()->subDays(4),
            'current_stage_id' => $vipStages['champion']->id,
        ]);

        // VIP Contact 2: Inactive >14 days!
        $c2 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Tanaka-san',
            'display_name' => 'Tanaka MD',
            'contact_mode' => 'VIP_HOSPITALITY',
            'phone' => '+81 90-8888-0002',
            'sns_account' => '@tanaka_ginza',
            'birthday' => $now->copy()->subYears(45)->addMonths(3)->toDateString(),
            'expected_amount' => 180000.00,
            'lifetime_sales_amount' => 1200000.00,
            'custom_attributes' => [
                'preferred_drink' => 'Yamazaki 18y Highball',
                'notes' => 'Prefers late night visits after 23:00',
            ],
            'last_contacted_at' => $now->copy()->subDays(19), // INACTIVE > 14 days!
            'current_stage_id' => $vipStages['regular']->id,
        ]);

        // VIP Contact 3: Second Visit Hook
        $c3 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Alex Mercer',
            'display_name' => 'Alex Mercer (Creative)',
            'contact_mode' => 'VIP_HOSPITALITY',
            'phone' => '+81 90-8888-0003',
            'sns_account' => '@alex_mercer_art',
            'birthday' => $now->copy()->subYears(32)->addMonths(7)->toDateString(),
            'expected_amount' => 150000.00,
            'lifetime_sales_amount' => 75000.00,
            'custom_attributes' => [
                'preferred_drink' => 'Gin Tonic (Roku Gin)',
                'invited_by' => 'Kenji Sato',
            ],
            'last_contacted_at' => $now->copy()->subDays(2),
            'current_stage_id' => $vipStages['hook']->id,
        ]);

        // VIP Contact 4: Inquiry
        $c4 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Elena Rostova',
            'display_name' => 'Elena (Fashion)',
            'contact_mode' => 'VIP_HOSPITALITY',
            'phone' => '+81 90-8888-0004',
            'sns_account' => '@elena_fashion_tokyo',
            'birthday' => $now->copy()->subYears(28)->toDateString(),
            'expected_amount' => 80000.00,
            'lifetime_sales_amount' => 0.00,
            'custom_attributes' => [
                'referred_channel' => 'Instagram DM',
            ],
            'last_contacted_at' => $now->copy()->subDays(1),
            'current_stage_id' => $vipStages['inquiry']->id,
        ]);

        // B2B Contact 1: Discovery Call
        $b1 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Acme Corporation Japan',
            'display_name' => 'Acme Corp (Y. Watanabe)',
            'contact_mode' => 'B2B_CONSULTING',
            'phone' => '+81 3-5555-0101',
            'sns_account' => '@acme_jp_official',
            'expected_amount' => 500000.00,
            'lifetime_sales_amount' => 0.00,
            'custom_attributes' => [
                'scope' => 'SFA System Integration Advisory',
                'team_size' => '50-100',
            ],
            'last_contacted_at' => $now->copy()->subDays(5),
            'current_stage_id' => $b2bStages['discovery']->id,
        ]);

        // B2B Contact 2: Proposal Sent
        $b2 = Contact::create([
            'user_id' => $user->id,
            'name' => 'Nexus Media Group',
            'display_name' => 'Nexus Media (K. Ito)',
            'contact_mode' => 'B2B_CONSULTING',
            'phone' => '+81 3-5555-0102',
            'sns_account' => '@nexus_media_jp',
            'expected_amount' => 1200000.00,
            'lifetime_sales_amount' => 600000.00,
            'custom_attributes' => [
                'scope' => 'Annual Sales Consulting Retainer',
            ],
            'last_contacted_at' => $now->copy()->subDays(3),
            'current_stage_id' => $b2bStages['proposal']->id,
        ]);

        // 7. Interaction Logs
        InteractionLog::create([
            'user_id' => $user->id,
            'contact_id' => $c1->id,
            'template_id' => $tplBirthday->id,
            'channel' => 'LINE',
            'notes' => 'Sent birthday wish and reserved Private VIP Booth A with Dom Perignon.',
            'interacted_at' => $now->copy()->subHours(2),
        ]);

        InteractionLog::create([
            'user_id' => $user->id,
            'contact_id' => $c3->id,
            'template_id' => $tplWeekend->id,
            'channel' => 'INSTAGRAM_DM',
            'notes' => 'Followed up after initial visit. Confirmed attendance for upcoming Saturday lounge.',
            'interacted_at' => $now->copy()->subDays(2),
        ]);

        // 8. Transactions (Totaling 620,000 JPY confirmed sales this month)
        // Tx 1: 450,000 JPY paid by Credit Card, attributed to post1
        Transaction::create([
            'user_id' => $user->id,
            'contact_id' => $c1->id,
            'attributed_social_post_id' => $post1->id,
            'amount' => 450000.00,
            'payment_method' => 'CREDIT_CARD',
            'is_settled' => true,
            'sync_status' => 'SYNCED',
            'transaction_date' => $now->copy()->subDays(1)->toDateString(),
            'metadata' => ['order_type' => 'Bottle Service VIP', 'invoice_no' => 'INV-2026-001'],
        ]);

        // Tx 2: 170,000 JPY paid by Cash, attributed to post2
        Transaction::create([
            'user_id' => $user->id,
            'contact_id' => $c2->id,
            'attributed_social_post_id' => $post2->id,
            'amount' => 170000.00,
            'payment_method' => 'CASH',
            'is_settled' => true,
            'sync_status' => 'SYNCED',
            'transaction_date' => $now->copy()->subDays(3)->toDateString(),
            'metadata' => ['order_type' => 'Table Reserve', 'invoice_no' => 'INV-2026-002'],
        ]);

        // Tx 3: 75,000 JPY Unpaid Tab / Receivable (ツケ)
        Transaction::create([
            'user_id' => $user->id,
            'contact_id' => $c3->id,
            'attributed_social_post_id' => null,
            'amount' => 75000.00,
            'payment_method' => 'RECEIVABLE',
            'is_settled' => false, // Tab unpaid!
            'sync_status' => 'SYNCED',
            'transaction_date' => $now->toDateString(),
            'metadata' => ['order_type' => 'Bar Tab', 'settlement_due' => $now->copy()->addDays(14)->toDateString()],
        ]);
    }
}

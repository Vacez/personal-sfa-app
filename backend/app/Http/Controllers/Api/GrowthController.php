<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Services\SocialSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GrowthController extends Controller
{
    protected SocialSyncService $socialSyncService;

    public function __construct(SocialSyncService $socialSyncService)
    {
        $this->socialSyncService = $socialSyncService;
    }

    public function socialPosts(Request $request): JsonResponse
    {
        $posts = SocialPost::where('user_id', $request->user()->id)
            ->with('socialAccount')
            ->orderBy('posted_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    public function templateAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $mode = $request->query('mode', $user->default_mode);

        $templates = MessageTemplate::where('user_id', $user->id)
            ->where('mode', $mode)
            ->get()
            ->sortByDesc('cvr_percentage')
            ->values();

        return response()->json($templates);
    }

    public function syncSocial(Request $request): JsonResponse
    {
        $user = $request->user();
        $forceMock = $request->boolean('force_mock', false);

        $accounts = SocialAccount::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        if ($accounts->isEmpty()) {
            // Auto-create a mock social account if none exists
            $account = SocialAccount::create([
                'user_id' => $user->id,
                'platform' => 'INSTAGRAM',
                'account_username' => 'vip_omotenashi_tokyo',
                'access_token' => 'mock_token',
                'is_active' => true,
            ]);
            $accounts = collect([$account]);
        }

        $allSynced = [];
        $errors = [];

        foreach ($accounts as $account) {
            try {
                $synced = $this->socialSyncService->syncAccount($account, $forceMock);
                $allSynced = array_merge($allSynced, $synced);
            } catch (\Exception $e) {
                $errors[] = [
                    'account_id' => $account->id,
                    'platform' => $account->platform,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Social synchronization completed',
            'synced_count' => count($allSynced),
            'errors' => $errors,
            'posts' => $this->socialPosts($request)->original,
        ]);
    }

    public function accounts(Request $request): JsonResponse
    {
        $accounts = SocialAccount::where('user_id', $request->user()->id)->get();
        return response()->json($accounts);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:128',
            'content' => 'required|string',
            'mode' => 'required|string|in:B2B_CONSULTING,VIP_HOSPITALITY',
        ]);

        $template = MessageTemplate::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'used_count' => 0,
            'converted_count' => 0,
        ]));

        return response()->json($template, 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'name' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:32',
            'default_mode' => 'required|string|in:B2B_CONSULTING,VIP_HOSPITALITY',
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'] ?? null,
            'phone_number' => $validated['phone_number'] ?? null,
            'default_mode' => $validated['default_mode'],
            'monthly_sales_quota' => 1000000.00,
        ]);

        // Seed default pipeline stages for this user based on mode
        $this->seedDefaultStages($user);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'default_mode' => $user->default_mode,
                'monthly_sales_quota' => (float) $user->monthly_sales_quota,
            ]
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'default_mode' => $user->default_mode,
                'monthly_sales_quota' => (float) $user->monthly_sales_quota,
            ]
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'phone_number' => $user->phone_number,
            'default_mode' => $user->default_mode,
            'monthly_sales_quota' => (float) $user->monthly_sales_quota,
        ]);
    }

    public function updateMode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|string|in:B2B_CONSULTING,VIP_HOSPITALITY',
        ]);

        $user = $request->user();
        $user->default_mode = $validated['mode'];
        $user->save();

        return response()->json([
            'message' => 'Default mode updated successfully',
            'default_mode' => $user->default_mode,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    private function seedDefaultStages(User $user): void
    {
        $vipStages = [
            ['name' => 'First Visit / Inquiry', 'win_probability_rate' => 20, 'sort_order' => 1],
            ['name' => 'Second Visit Hook', 'win_probability_rate' => 45, 'sort_order' => 2],
            ['name' => 'Regular Patron', 'win_probability_rate' => 75, 'sort_order' => 3],
            ['name' => 'VIP Champion', 'win_probability_rate' => 95, 'sort_order' => 4],
        ];

        $b2bStages = [
            ['name' => 'Lead Inbound', 'win_probability_rate' => 15, 'sort_order' => 1],
            ['name' => 'Discovery Call', 'win_probability_rate' => 35, 'sort_order' => 2],
            ['name' => 'Proposal Sent', 'win_probability_rate' => 60, 'sort_order' => 3],
            ['name' => 'Contract Finalization', 'win_probability_rate' => 90, 'sort_order' => 4],
            ['name' => 'Closed Won', 'win_probability_rate' => 100, 'sort_order' => 5],
        ];

        foreach ($vipStages as $stage) {
            PipelineStage::create(array_merge($stage, [
                'user_id' => $user->id,
                'mode' => 'VIP_HOSPITALITY',
                'is_system_default' => true,
            ]));
        }

        foreach ($b2bStages as $stage) {
            PipelineStage::create(array_merge($stage, [
                'user_id' => $user->id,
                'mode' => 'B2B_CONSULTING',
                'is_system_default' => true,
            ]));
        }
    }
}

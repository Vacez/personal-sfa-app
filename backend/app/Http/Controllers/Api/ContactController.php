<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\InteractionLog;
use App\Models\MessageTemplate;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Contact::with('stage')->where('user_id', $user->id);

        if ($request->filled('mode')) {
            $query->where('contact_mode', $request->query('mode'));
        }

        $sortBy = $request->query('sort_by', 'ltv');
        switch ($sortBy) {
            case 'last_contacted':
                $query->orderBy('last_contacted_at', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'expected':
                $query->orderBy('expected_amount', 'desc');
                break;
            case 'ltv':
            default:
                $query->orderBy('lifetime_sales_amount', 'desc');
                break;
        }

        $contacts = $query->get();

        return response()->json($contacts);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $contact = Contact::with(['stage', 'interactionLogs.template', 'transactions.attributedSocialPost'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($contact);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'contact_mode' => 'required|string|in:B2B_CONSULTING,VIP_HOSPITALITY',
            'phone' => 'nullable|string|max:64',
            'sns_account' => 'nullable|string|max:128',
            'birthday' => 'nullable|date',
            'expected_amount' => 'nullable|numeric|min:0',
            'current_stage_id' => 'nullable|uuid|exists:pipeline_stages,id',
            'custom_attributes' => 'nullable|array',
        ]);

        $contact = Contact::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'expected_amount' => $validated['expected_amount'] ?? 0.00,
            'lifetime_sales_amount' => 0.00,
            'last_contacted_at' => Carbon::now(),
        ]));

        $contact->load('stage');

        return response()->json($contact, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $contact = Contact::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'contact_mode' => 'sometimes|string|in:B2B_CONSULTING,VIP_HOSPITALITY',
            'phone' => 'nullable|string|max:64',
            'sns_account' => 'nullable|string|max:128',
            'birthday' => 'nullable|date',
            'expected_amount' => 'nullable|numeric|min:0',
            'current_stage_id' => 'nullable|uuid|exists:pipeline_stages,id',
            'custom_attributes' => 'nullable|array',
            'last_contacted_at' => 'nullable|date',
        ]);

        $contact->update($validated);
        $contact->load('stage');

        return response()->json($contact);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $contact = Contact::where('user_id', $request->user()->id)->findOrFail($id);
        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }

    public function logInteraction(Request $request, string $id): JsonResponse
    {
        $contact = Contact::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'channel' => 'required|string|in:LINE,INSTAGRAM_DM,EMAIL,PHONE,IN_PERSON',
            'template_id' => 'nullable|uuid|exists:message_templates,id',
            'notes' => 'nullable|string',
        ]);

        $interaction = InteractionLog::create([
            'user_id' => $request->user()->id,
            'contact_id' => $contact->id,
            'template_id' => $validated['template_id'] ?? null,
            'channel' => $validated['channel'],
            'notes' => $validated['notes'] ?? null,
            'interacted_at' => Carbon::now(),
        ]);

        // Update contact last_contacted_at
        $contact->last_contacted_at = Carbon::now();
        $contact->save();

        // Increment template used_count if template used
        if (!empty($validated['template_id'])) {
            $template = MessageTemplate::find($validated['template_id']);
            if ($template) {
                $template->increment('used_count');
            }
        }

        $interaction->load('template');

        return response()->json([
            'message' => 'Interaction logged successfully',
            'interaction' => $interaction,
            'contact' => $contact->load('stage'),
        ], 201);
    }
}

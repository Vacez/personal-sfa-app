<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PipelineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $mode = $request->query('mode', $user->default_mode);

        $stages = PipelineStage::where('user_id', $user->id)
            ->where('mode', $mode)
            ->orderBy('sort_order', 'asc')
            ->with(['contacts' => function ($query) {
                $query->orderBy('expected_amount', 'desc');
            }])
            ->get();

        // Calculate summary metrics
        $stagesWithMetrics = $stages->map(function ($stage) {
            $totalExpected = (float) $stage->contacts->sum('expected_amount');
            $weightedTotal = round($totalExpected * ($stage->win_probability_rate / 100.0), 2);

            return [
                'id' => $stage->id,
                'name' => $stage->name,
                'mode' => $stage->mode,
                'sort_order' => $stage->sort_order,
                'win_probability_rate' => $stage->win_probability_rate,
                'contacts_count' => $stage->contacts->count(),
                'total_expected' => $totalExpected,
                'weighted_total' => $weightedTotal,
                'contacts' => $stage->contacts,
            ];
        });

        $totalPipeline = $stagesWithMetrics->sum('total_expected');
        $totalWeighted = $stagesWithMetrics->sum('weighted_total');

        return response()->json([
            'mode' => $mode,
            'total_pipeline' => round($totalPipeline, 2),
            'total_weighted' => round($totalWeighted, 2),
            'stages' => $stagesWithMetrics,
        ]);
    }

    public function updateContactStage(Request $request, string $contactId): JsonResponse
    {
        $validated = $request->validate([
            'stage_id' => 'required|uuid|exists:pipeline_stages,id',
        ]);

        $contact = Contact::where('user_id', $request->user()->id)->findOrFail($contactId);
        $stage = PipelineStage::where('user_id', $request->user()->id)->findOrFail($validated['stage_id']);

        $contact->current_stage_id = $stage->id;
        $contact->save();

        return response()->json([
            'message' => 'Contact stage updated successfully',
            'contact' => $contact->load('stage'),
        ]);
    }
}

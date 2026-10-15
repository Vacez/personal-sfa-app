<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AlertService;
use App\Services\ForecastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected ForecastService $forecastService;
    protected AlertService $alertService;

    public function __construct(ForecastService $forecastService, AlertService $alertService)
    {
        $this->forecastService = $forecastService;
        $this->alertService = $alertService;
    }

    public function forecast(Request $request): JsonResponse
    {
        $forecast = $this->forecastService->getMonthlyForecast($request->user());

        return response()->json($forecast);
    }

    public function alerts(Request $request): JsonResponse
    {
        $alerts = $this->alertService->getActionAlerts($request->user());

        return response()->json($alerts);
    }
}

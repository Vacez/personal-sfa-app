<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GrowthController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Personal SFA API Routes (Version 2.2)
|--------------------------------------------------------------------------
*/

$registerRoutes = function () {
    // 1. Authentication
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::patch('/auth/mode', [AuthController::class, 'updateMode']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // 2. Dashboard & Forecasting
        Route::get('/dashboard/forecast', [DashboardController::class, 'forecast']);
        Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

        // 3. Contacts, LTV & Interactions
        Route::get('/contacts', [ContactController::class, 'index']);
        Route::post('/contacts', [ContactController::class, 'store']);
        Route::get('/contacts/{id}', [ContactController::class, 'show']);
        Route::put('/contacts/{id}', [ContactController::class, 'update']);
        Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
        Route::post('/contacts/{id}/interactions', [ContactController::class, 'logInteraction']);

        // 4. Pipeline & Deals
        Route::get('/pipeline/stages', [PipelineController::class, 'index']);
        Route::patch('/pipeline/contacts/{contactId}/stage', [PipelineController::class, 'updateContactStage']);

        // 5. Growth, Social Attribution & Templates
        Route::get('/social/posts', [GrowthController::class, 'socialPosts']);
        Route::post('/social/sync', [GrowthController::class, 'syncSocial']);
        Route::get('/social/accounts', [GrowthController::class, 'accounts']);
        Route::get('/templates/analytics', [GrowthController::class, 'templateAnalytics']);
        Route::post('/templates', [GrowthController::class, 'storeTemplate']);

        // 6. Transactions & Accounting
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::patch('/transactions/{id}/settle', [TransactionController::class, 'settle']);
    });
};

// Route group with prefix v1 (OpenAPI Specification)
Route::prefix('v1')->group($registerRoutes);

// Also expose at root /api/... for flexible client connection
$registerRoutes();

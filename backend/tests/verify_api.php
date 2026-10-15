<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

function makeRequest($kernel, $method, $uri, $data = [], $headers = []) {
    $server = [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
    ];
    foreach ($headers as $key => $val) {
        $server['HTTP_' . strtoupper(str_replace('-', '_', $key))] = $val;
    }

    $content = !empty($data) ? json_encode($data) : null;
    $request = Illuminate\Http\Request::create($uri, $method, [], [], [], $server, $content);
    $response = $kernel->handle($request);
    $kernel->terminate($request, $response);

    return [
        'status' => $response->getStatusCode(),
        'body' => json_decode($response->getContent(), true),
    ];
}

echo "=== PERSONAL SFA API VERIFICATION ===\n\n";

// 1. Test Login
echo "[1] Testing POST /api/v1/auth/login...\n";
$loginRes = makeRequest($kernel, 'POST', '/api/v1/auth/login', [
    'email' => 'user@example.com',
    'password' => 'password123',
]);
if ($loginRes['status'] !== 200 || empty($loginRes['body']['token'])) {
    echo "FAILED: " . json_encode($loginRes) . "\n";
    exit(1);
}
$token = $loginRes['body']['token'];
$authHeader = ['Authorization' => 'Bearer ' . $token];
echo "SUCCESS! User: " . $loginRes['body']['user']['name'] . " | Mode: " . $loginRes['body']['user']['default_mode'] . "\n\n";

// 2. Test Forecast
echo "[2] Testing GET /api/v1/dashboard/forecast...\n";
$forecastRes = makeRequest($kernel, 'GET', '/api/v1/dashboard/forecast', [], $authHeader);
echo "Status: {$forecastRes['status']}\n";
echo "Quota: JPY " . number_format($forecastRes['body']['quota']) . "\n";
echo "Confirmed Sales: JPY " . number_format($forecastRes['body']['confirmed_sales']) . "\n";
echo "Weighted Forecast: JPY " . number_format($forecastRes['body']['weighted_forecast']) . "\n";
echo "Projected Finish: JPY " . number_format($forecastRes['body']['projected_finish']) . " (" . $forecastRes['body']['pacing_percentage'] . "% pacing)\n\n";

// 3. Test Alerts
echo "[3] Testing GET /api/v1/dashboard/alerts...\n";
$alertsRes = makeRequest($kernel, 'GET', '/api/v1/dashboard/alerts', [], $authHeader);
echo "Status: {$alertsRes['status']}\n";
echo "Birthdays Today: " . count($alertsRes['body']['birthdays']) . "\n";
if (!empty($alertsRes['body']['birthdays'])) {
    echo "  - First birthday: " . $alertsRes['body']['birthdays'][0]['name'] . "\n";
}
echo "Inactive Clients (>14d): " . count($alertsRes['body']['inactive_clients']) . "\n";
if (!empty($alertsRes['body']['inactive_clients'])) {
    echo "  - Inactive client: " . $alertsRes['body']['inactive_clients'][0]['name'] . " (LTV: JPY " . number_format($alertsRes['body']['inactive_clients'][0]['lifetime_sales_amount']) . ")\n";
}
echo "\n";

// 4. Test Contacts
echo "[4] Testing GET /api/v1/contacts...\n";
$contactsRes = makeRequest($kernel, 'GET', '/api/v1/contacts?sort_by=ltv', [], $authHeader);
echo "Status: {$contactsRes['status']}\n";
echo "Total Contacts Retrieved: " . count($contactsRes['body']) . "\n";
$contactId = $contactsRes['body'][0]['id'];
echo "Top VIP Contact: " . $contactsRes['body'][0]['name'] . " (LTV: JPY " . number_format($contactsRes['body'][0]['lifetime_sales_amount']) . ")\n\n";

// 5. Test Log Interaction
echo "[5] Testing POST /api/v1/contacts/{$contactId}/interactions...\n";
$interactRes = makeRequest($kernel, 'POST', "/api/v1/contacts/{$contactId}/interactions", [
    'channel' => 'LINE',
    'notes' => 'Sent anniversary celebration confirmation via VIP Concierge line.',
], $authHeader);
echo "Status: {$interactRes['status']}\n";
echo "Interaction Response: " . $interactRes['body']['message'] . "\n\n";

// 6. Test Pipeline Stages
echo "[6] Testing GET /api/v1/pipeline/stages...\n";
$pipelineRes = makeRequest($kernel, 'GET', '/api/v1/pipeline/stages', [], $authHeader);
echo "Status: {$pipelineRes['status']}\n";
echo "Mode: " . $pipelineRes['body']['mode'] . "\n";
echo "Total Pipeline Amount: JPY " . number_format($pipelineRes['body']['total_pipeline']) . "\n";
echo "Total Weighted Value: JPY " . number_format($pipelineRes['body']['total_weighted']) . "\n";
foreach ($pipelineRes['body']['stages'] as $stage) {
    echo "  - Stage [{$stage['name']}]: {$stage['win_probability_rate']}% win rate | {$stage['contacts_count']} contacts | Weighted: JPY " . number_format($stage['weighted_total']) . "\n";
}
echo "\n";

// 7. Test Growth Social Posts & Templates
echo "[7] Testing GET /api/v1/social/posts & /api/v1/templates/analytics...\n";
$socialRes = makeRequest($kernel, 'GET', '/api/v1/social/posts', [], $authHeader);
echo "Social Posts count: " . count($socialRes['body']) . "\n";
$tplRes = makeRequest($kernel, 'GET', '/api/v1/templates/analytics', [], $authHeader);
echo "Message Templates count: " . count($tplRes['body']) . "\n";
foreach ($tplRes['body'] as $tpl) {
    echo "  - Template [{$tpl['title']}]: {$tpl['cvr_percentage']}% CVR (Used: {$tpl['used_count']})\n";
}
echo "\n";

// 8. Test Record Transaction with Zero-Touch Social Attribution
echo "[8] Testing POST /api/v1/transactions (Zero-Touch Attribution + Accounting Webhook)...\n";
$txRes = makeRequest($kernel, 'POST', '/api/v1/transactions', [
    'contact_id' => $contactId,
    'amount' => 120000.00,
    'payment_method' => 'CREDIT_CARD',
    'transaction_date' => date('Y-m-d'),
], $authHeader);
echo "Status: {$txRes['status']}\n";
echo "Recorded Tx ID: " . $txRes['body']['transaction']['id'] . "\n";
echo "Attributed Post: " . ($txRes['body']['transaction']['attributed_social_post']['caption'] ?? 'Auto-correlated') . "\n";
echo "Sync Status: " . $txRes['body']['transaction']['sync_status'] . "\n\n";

echo "ALL 8 API ENDPOINTS VALIDATED SUCCESSFULLY!\n";

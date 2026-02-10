<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AnalysisController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BranchGoalController;
use App\Http\Controllers\Api\DailyActivityGoalController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentCategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FollowUpProspectController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\LeadBriefingController;
use App\Http\Controllers\Api\NewProspectController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\PriceController;
use App\Http\Controllers\Api\OvertimeRequestController;
use App\Http\Controllers\Api\ReimbursementController;
use App\Http\Controllers\Api\SalesShiftController;
use App\Http\Controllers\Api\SalesGoalController;
use App\Http\Controllers\Api\SalesShiftScheduleController;
use App\Http\Controllers\Api\SalesDashboardController;
use App\Http\Controllers\Api\SpkController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::post('attendances/{attendance}/cleanliness-photos', [AttendanceController::class, 'uploadCleanliness']);
    Route::get('attendances', [AttendanceController::class, 'index']);
    Route::get('attendances/{attendance}', [AttendanceController::class, 'show']);

    Route::post('activities', [ActivityController::class, 'store']);
    Route::post('activities/{activity}/proofs', [ActivityController::class, 'addProof']);
    Route::delete('activities/proofs/{proof}', [ActivityController::class, 'destroyProof']);
    Route::get('activities', [ActivityController::class, 'index']);
    Route::get('activities/stats', [ActivityController::class, 'stats']);
    Route::get('new-prospects', [NewProspectController::class, 'index']);
    Route::post('new-prospects', [NewProspectController::class, 'store']);
    Route::get('follow-up-prospects', [FollowUpProspectController::class, 'index']);
    Route::post('follow-up-prospects', [FollowUpProspectController::class, 'store']);

    Route::get('events', [EventController::class, 'index']);
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{event}', [EventController::class, 'update']);
    Route::delete('events/{event}', [EventController::class, 'destroy']);

    Route::get('documents', [DocumentController::class, 'index']);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);

    Route::get('prices', [PriceController::class, 'index']);
    Route::get('stock', [StockController::class, 'index']);

    Route::get('document-categories', [DocumentCategoryController::class, 'index']);
    Route::get('sales-dashboard/summary', [SalesDashboardController::class, 'summary']);
    Route::get('sales-shift-schedules/me', [SalesShiftScheduleController::class, 'mySchedule']);
    Route::get('leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('leave-requests', [LeaveRequestController::class, 'store']);

    Route::middleware('role:sales')->group(function () {
        Route::get('overtimes', [OvertimeRequestController::class, 'index']);
        Route::post('overtimes', [OvertimeRequestController::class, 'store']);
        Route::get('reimbursements', [ReimbursementController::class, 'index']);
        Route::post('reimbursements', [ReimbursementController::class, 'store']);
    });

    Route::middleware('role:admin,leader')->group(function () {
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('analysis/summary', [AnalysisController::class, 'summary']);

        Route::get('leads', [LeadController::class, 'index']);
        Route::post('leads', [LeadController::class, 'store']);
        Route::put('leads/{lead}', [LeadController::class, 'update']);
        Route::post('leads/{lead}/followups', [LeadController::class, 'addFollowUp']);
        Route::get('lead-briefings', [LeadBriefingController::class, 'index']);
        Route::post('lead-briefings', [LeadBriefingController::class, 'store']);

        Route::post('documents', [DocumentController::class, 'store']);
        Route::delete('documents/{document}', [DocumentController::class, 'destroy']);
        Route::post('spk', [SpkController::class, 'store']);
        Route::get('spk', [SpkController::class, 'index']);
        Route::get('spk/summary', [SpkController::class, 'summary']);
        Route::put('spk/{spk}', [SpkController::class, 'update']);

        Route::post('prices', [PriceController::class, 'store']);
        Route::put('prices/{price}', [PriceController::class, 'update']);

        Route::post('stock', [StockController::class, 'store']);
        Route::put('stock/{stock}', [StockController::class, 'update']);

        Route::get('sales', [UserController::class, 'sales']);

        Route::get('branches', [BranchController::class, 'index']);
        Route::post('branches', [BranchController::class, 'store']);
        Route::put('branches/{branch}', [BranchController::class, 'update']);
        Route::delete('branches/{branch}', [BranchController::class, 'destroy']);

    });

    Route::middleware('role:admin')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);

        Route::get('goals/branches', [BranchGoalController::class, 'index']);
        Route::post('goals/branches', [BranchGoalController::class, 'store']);
        Route::put('goals/branches/{branchGoal}', [BranchGoalController::class, 'update']);
        Route::delete('goals/branches/{branchGoal}', [BranchGoalController::class, 'destroy']);

        Route::get('goals/sales', [SalesGoalController::class, 'index']);
        Route::post('goals/sales', [SalesGoalController::class, 'store']);
        Route::put('goals/sales/{salesGoal}', [SalesGoalController::class, 'update']);
        Route::delete('goals/sales/{salesGoal}', [SalesGoalController::class, 'destroy']);

        Route::get('goals/activity', [DailyActivityGoalController::class, 'index']);
        Route::post('goals/activity', [DailyActivityGoalController::class, 'store']);
        Route::put('goals/activity/{dailyActivityGoal}', [DailyActivityGoalController::class, 'update']);
        Route::delete('goals/activity/{dailyActivityGoal}', [DailyActivityGoalController::class, 'destroy']);

        Route::get('units', [UnitController::class, 'index']);
        Route::post('units', [UnitController::class, 'store']);
        Route::put('units/{unit}', [UnitController::class, 'update']);
        Route::delete('units/{unit}', [UnitController::class, 'destroy']);

        Route::get('sales-shifts', [SalesShiftController::class, 'index']);
        Route::post('sales-shifts', [SalesShiftController::class, 'store']);
        Route::put('sales-shifts/{salesShift}', [SalesShiftController::class, 'update']);
        Route::delete('sales-shifts/{salesShift}', [SalesShiftController::class, 'destroy']);

        Route::get('sales-shift-schedules', [SalesShiftScheduleController::class, 'index']);
        Route::post('sales-shift-schedules', [SalesShiftScheduleController::class, 'store']);

        Route::put('overtimes/{overtime}/status', [OvertimeRequestController::class, 'updateStatus']);
        Route::put('reimbursements/{reimbursement}/status', [ReimbursementController::class, 'updateStatus']);
    });
});

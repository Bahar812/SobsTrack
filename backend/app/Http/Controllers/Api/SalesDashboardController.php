<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use App\Models\DailyActivityGoal;
use App\Models\SalesGoal;
use App\Models\Spk;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SalesDashboardController extends Controller
{
    public function summary(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        try {
            $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        } catch (\Exception $exception) {
            $start = now()->startOfMonth();
            $month = $start->format('Y-m');
        }
        $end = $start->copy()->endOfMonth();
        $daysInMonth = $start->daysInMonth;

        $userId = $request->user()->id;

        $activityGoal = DailyActivityGoal::where('user_id', $userId)
            ->where('month', $month)
            ->first();

        $activityTargets = [
            'wa_story' => $activityGoal?->wa_story_target ?? 0,
            'fb_marketplace' => $activityGoal?->fb_marketplace_target ?? 0,
            'tiktok_post' => $activityGoal?->tiktok_post_target ?? 0,
            'new_prospect' => $activityGoal?->new_prospect_target ?? 0,
            'fu_prospect' => $activityGoal?->fu_prospect_target ?? 0,
        ];
        $activityTargetTotal = array_sum($activityTargets) * $daysInMonth;

        $activityActual = DailyActivity::where('user_id', $userId)
            ->whereBetween('activity_date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('
                SUM(wa_story_count) as wa_story,
                SUM(fb_marketplace_count) as fb_marketplace,
                SUM(tiktok_post_count) as tiktok_post,
                SUM(new_prospect_count) as new_prospect,
                SUM(fu_prospect_count) as fu_prospect
            ')
            ->first();

        $activityActuals = [
            'wa_story' => (int) ($activityActual->wa_story ?? 0),
            'fb_marketplace' => (int) ($activityActual->fb_marketplace ?? 0),
            'tiktok_post' => (int) ($activityActual->tiktok_post ?? 0),
            'new_prospect' => (int) ($activityActual->new_prospect ?? 0),
            'fu_prospect' => (int) ($activityActual->fu_prospect ?? 0),
        ];
        $activityActualTotal = array_sum($activityActuals);
        $activityPercent = $activityTargetTotal > 0
            ? round(($activityActualTotal / $activityTargetTotal) * 100, 1)
            : 0.0;

        $today = now()->toDateString();
        $todayActivity = DailyActivity::where('user_id', $userId)
            ->whereDate('activity_date', $today)
            ->first();

        $todayActuals = [
            'wa_story' => (int) ($todayActivity->wa_story_count ?? 0),
            'fb_marketplace' => (int) ($todayActivity->fb_marketplace_count ?? 0),
            'tiktok_post' => (int) ($todayActivity->tiktok_post_count ?? 0),
            'new_prospect' => (int) ($todayActivity->new_prospect_count ?? 0),
            'fu_prospect' => (int) ($todayActivity->fu_prospect_count ?? 0),
        ];

        $missing = [];
        foreach ($activityTargets as $key => $target) {
            if ($target > 0 && ($todayActuals[$key] ?? 0) < $target) {
                $missing[] = $key;
            }
        }

        $salesTarget = (int) SalesGoal::where('user_id', $userId)
            ->where('month', $month)
            ->sum('unit_target');

        $salesActual = Spk::where('sales_id', $userId)
            ->whereBetween('spk_date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $salesPercent = $salesTarget > 0 ? round(($salesActual / $salesTarget) * 100, 1) : 0.0;

        return response()->json([
            'month' => $month,
            'activity' => [
                'actual_total' => $activityActualTotal,
                'target_total' => $activityTargetTotal,
                'percent' => $activityPercent,
                'targets_daily' => $activityTargets,
                'actuals_month' => $activityActuals,
                'today' => [
                    'actuals' => $todayActuals,
                    'missing' => $missing,
                    'is_complete' => empty($missing),
                ],
            ],
            'sales' => [
                'actual' => $salesActual,
                'target' => $salesTarget,
                'percent' => $salesPercent,
            ],
        ]);
    }
}

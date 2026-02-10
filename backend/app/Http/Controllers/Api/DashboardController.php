<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DailyActivity;
use App\Models\Lead;
use App\Models\Event;
use App\Models\Spk;
use App\Models\StockUnit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $attendanceToday = Attendance::whereDate('attendance_date', $today)->count();
        $activityToday = DailyActivity::whereDate('activity_date', $today)->count();
        $leadsActive = Lead::whereIn('status', ['new', 'fu'])->count();
        $spkThisMonth = Spk::whereDate('spk_date', '>=', $monthStart)->count();
        $stockAvailable = StockUnit::where('status', 'available')->count();

        $ranking = Spk::select('sales_id', DB::raw('COUNT(*) as total'))
            ->whereDate('spk_date', '>=', $monthStart)
            ->groupBy('sales_id')
            ->with('sales:id,name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        $eventsThisWeek = Event::with('branch:id,name')
            ->whereBetween('event_start', [$weekStart, $weekEnd])
            ->orderBy('event_start')
            ->get();

        return response()->json([
            'cards' => [
                'attendance_today' => $attendanceToday,
                'activity_today' => $activityToday,
                'leads_active' => $leadsActive,
                'spk_this_month' => $spkThisMonth,
                'stock_available' => $stockAvailable,
            ],
            'ranking' => $ranking,
            'events_this_week' => $eventsThisWeek,
        ]);
    }
}

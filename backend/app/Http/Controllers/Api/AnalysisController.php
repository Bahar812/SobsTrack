<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalysisController extends Controller
{
    public function summary(Request $request)
    {
        $weekly = Spk::selectRaw("YEARWEEK(spk_date, 1) as period")
            ->selectRaw("MIN(spk_date) as period_start")
            ->selectRaw("COUNT(*) as total_spk")
            ->selectRaw("SUM(CASE WHEN COALESCE(spk_status, 'spk') = 'do' THEN 1 ELSE 0 END) as total_do")
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $monthly = Spk::selectRaw("DATE_FORMAT(spk_date, '%Y-%m') as period")
            ->selectRaw("MIN(spk_date) as period_start")
            ->selectRaw("COUNT(*) as total_spk")
            ->selectRaw("SUM(CASE WHEN COALESCE(spk_status, 'spk') = 'do' THEN 1 ELSE 0 END) as total_do")
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $topUnits = Spk::selectRaw("COALESCE(NULLIF(TRIM(CONCAT_WS(' ', brand, type, color)), ''), unit_name) as label")
            ->selectRaw("COUNT(*) as total")
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->groupBy('label')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        $topBranches = Spk::join('branches', 'branches.id', '=', 'spk.branch_id')
            ->selectRaw("branches.name as branch")
            ->selectRaw("COUNT(*) as total")
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->groupBy('branches.name')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        $agePerUnit = Spk::selectRaw("COALESCE(NULLIF(TRIM(CONCAT_WS(' ', brand, type)), ''), unit_name) as label")
            ->selectRaw("AVG(customer_age) as avg_age")
            ->selectRaw("COUNT(*) as total")
            ->whereNotNull('customer_age')
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->groupBy('label')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        $ageGroups = Spk::selectRaw(
            "CASE
                WHEN customer_age BETWEEN 18 AND 24 THEN '18-24'
                WHEN customer_age BETWEEN 25 AND 34 THEN '25-34'
                WHEN customer_age BETWEEN 35 AND 44 THEN '35-44'
                WHEN customer_age BETWEEN 45 AND 54 THEN '45-54'
                WHEN customer_age >= 55 THEN '55+'
                ELSE 'Unknown'
            END as age_group"
        )
            ->selectRaw("COUNT(*) as total")
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereBetween('spk_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->filled('start_date') && !$request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '>=', $request->start_date);
            })
            ->when(!$request->filled('start_date') && $request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('spk_date', '<=', $request->end_date);
            })
            ->whereNotNull('customer_age')
            ->groupBy('age_group')
            ->orderBy('age_group')
            ->get();

        return response()->json([
            'forecast' => [
                'weekly' => $weekly,
                'monthly' => $monthly,
            ],
            'top_units' => $topUnits,
            'top_branches' => $topBranches,
            'age_per_unit' => $agePerUnit,
            'age_groups' => $ageGroups,
        ]);
    }
}

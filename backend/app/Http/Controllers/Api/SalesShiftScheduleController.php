<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesShiftSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesShiftScheduleController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $query = SalesShiftSchedule::with(['user:id,name,branch_id', 'user.branch:id,name'])
            ->whereBetween('shift_date', [$data['start_date'], $data['end_date']])
            ->whereHas('user', function ($subQuery) use ($data) {
                $subQuery->where('branch_id', $data['branch_id'])->where('role', 'sales');
            })
            ->orderBy('shift_date');

        $grouped = [];
        foreach ($query->get() as $item) {
            $dateKey = $item->shift_date->format('Y-m-d');
            if (!isset($grouped[$dateKey])) {
                $grouped[$dateKey] = [];
            }
            $grouped[$dateKey][] = [
                'id' => $item->user->id,
                'name' => $item->user->name,
                'branch' => $item->user->branch,
            ];
        }

        $response = [];
        foreach ($grouped as $date => $sales) {
            $response[] = [
                'date' => $date,
                'sales' => $sales,
            ];
        }

        return response()->json($response);
    }

    public function mySchedule(Request $request)
    {
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $schedules = SalesShiftSchedule::with('user:id,name')
            ->where('user_id', $request->user()->id)
            ->whereBetween('shift_date', [$data['start_date'], $data['end_date']])
            ->orderBy('shift_date')
            ->get();

        $response = [];
        foreach ($schedules as $item) {
            $response[] = [
                'date' => $item->shift_date->format('Y-m-d'),
                'sales' => [
                    [
                        'id' => $item->user->id,
                        'name' => $item->user->name,
                    ],
                ],
            ];
        }

        return response()->json($response);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'shift_date' => 'required|date',
            'branch_id' => 'required|exists:branches,id',
            'user_ids' => 'nullable|array',
            'user_ids.*' => [
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
        ]);

        $allowedIds = User::where('role', 'sales')
            ->where('branch_id', $data['branch_id'])
            ->pluck('id')
            ->all();

        $userIds = array_values(array_unique(array_map('intval', $data['user_ids'] ?? [])));
        $invalid = array_diff($userIds, $allowedIds);
        if (!empty($invalid)) {
            return response()->json(['message' => 'Sales harus berasal dari cabang yang dipilih.'], 422);
        }

        SalesShiftSchedule::where('shift_date', $data['shift_date'])
            ->whereIn('user_id', $allowedIds)
            ->delete();

        $rows = [];
        foreach ($userIds as $userId) {
            $rows[] = [
                'user_id' => $userId,
                'shift_date' => $data['shift_date'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        if (!empty($rows)) {
            SalesShiftSchedule::insert($rows);
        }

        return response()->json(['message' => 'Shift updated.']);
    }
}

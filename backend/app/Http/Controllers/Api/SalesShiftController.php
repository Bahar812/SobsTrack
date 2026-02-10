<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesShift;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesShiftController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $query = SalesShift::with(['user:id,name,branch_id,role', 'user.branch:id,name'])
            ->where('month', $month);

        if ($request->filled('sales_id')) {
            $query->where('user_id', $request->sales_id);
        }

        return response()->json($query->orderBy('user_id')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'week1_shift' => 'nullable|string|max:50',
            'week2_shift' => 'nullable|string|max:50',
            'week3_shift' => 'nullable|string|max:50',
            'week4_shift' => 'nullable|string|max:50',
        ]);

        $shift = SalesShift::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'month' => $data['month'],
            ],
            [
                'week1_shift' => $data['week1_shift'] ?? null,
                'week2_shift' => $data['week2_shift'] ?? null,
                'week3_shift' => $data['week3_shift'] ?? null,
                'week4_shift' => $data['week4_shift'] ?? null,
            ]
        );

        $shift->load(['user:id,name,branch_id,role', 'user.branch:id,name']);

        return response()->json($shift, 201);
    }

    public function update(Request $request, SalesShift $salesShift)
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'week1_shift' => 'nullable|string|max:50',
            'week2_shift' => 'nullable|string|max:50',
            'week3_shift' => 'nullable|string|max:50',
            'week4_shift' => 'nullable|string|max:50',
        ]);

        $salesShift->update($data);
        $salesShift->load(['user:id,name,branch_id,role', 'user.branch:id,name']);

        return response()->json($salesShift);
    }

    public function destroy(SalesShift $salesShift)
    {
        $salesShift->delete();

        return response()->json(['message' => 'Shift deleted.']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchGoal;
use Illuminate\Http\Request;

class BranchGoalController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $query = BranchGoal::with('branch:id,name')->where('month', $month);

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json($query->orderBy('branch_id')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'unit_name' => 'required|string|max:120',
            'unit_target' => 'required|integer|min:0',
        ]);

        $goal = BranchGoal::updateOrCreate(
            [
                'branch_id' => $data['branch_id'],
                'month' => $data['month'],
                'unit_name' => $data['unit_name'],
            ],
            [
                'unit_target' => $data['unit_target'],
            ]
        );

        return response()->json($goal, 201);
    }

    public function update(Request $request, BranchGoal $branchGoal)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'unit_name' => 'required|string|max:120',
            'unit_target' => 'required|integer|min:0',
        ]);

        $branchGoal->update($data);

        return response()->json($branchGoal);
    }

    public function destroy(BranchGoal $branchGoal)
    {
        $branchGoal->delete();

        return response()->json(['message' => 'Goal deleted.']);
    }
}

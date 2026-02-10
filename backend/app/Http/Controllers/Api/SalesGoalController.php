<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesGoal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesGoalController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $query = SalesGoal::with([
            'user:id,name,branch_id,role',
            'user.branch:id,name',
            'branch:id,name',
        ])->where('month', $month);

        if ($request->filled('sales_id')) {
            $query->where('user_id', $request->sales_id);
        }
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->filled('name')) {
            $query->whereHas('user', function ($subQuery) use ($request) {
                $subQuery->where('name', 'like', '%' . $request->name . '%');
            });
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
            'branch_id' => 'nullable|exists:branches,id',
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'unit_name' => 'required|string|max:120',
            'unit_target' => 'required|integer|min:0',
            'wa_story_target' => 'nullable|integer|min:0',
            'fb_marketplace_target' => 'nullable|integer|min:0',
            'tiktok_post_target' => 'nullable|integer|min:0',
            'new_prospect_target' => 'nullable|integer|min:0',
            'fu_prospect_target' => 'nullable|integer|min:0',
        ]);

        $user = User::select('id', 'branch_id')->findOrFail($data['user_id']);
        $branchId = $data['branch_id'] ?? $user->branch_id;

        $goal = SalesGoal::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'month' => $data['month'],
                'unit_name' => $data['unit_name'],
            ],
            [
                'branch_id' => $branchId,
                'unit_target' => $data['unit_target'],
                'wa_story_target' => $data['wa_story_target'] ?? 0,
                'fb_marketplace_target' => $data['fb_marketplace_target'] ?? 0,
                'tiktok_post_target' => $data['tiktok_post_target'] ?? 0,
                'new_prospect_target' => $data['new_prospect_target'] ?? 0,
                'fu_prospect_target' => $data['fu_prospect_target'] ?? 0,
            ]
        );

        return response()->json($goal, 201);
    }

    public function update(Request $request, SalesGoal $salesGoal)
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
            'branch_id' => 'nullable|exists:branches,id',
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'unit_name' => 'required|string|max:120',
            'unit_target' => 'required|integer|min:0',
            'wa_story_target' => 'nullable|integer|min:0',
            'fb_marketplace_target' => 'nullable|integer|min:0',
            'tiktok_post_target' => 'nullable|integer|min:0',
            'new_prospect_target' => 'nullable|integer|min:0',
            'fu_prospect_target' => 'nullable|integer|min:0',
        ]);

        $user = User::select('id', 'branch_id')->findOrFail($data['user_id']);
        $branchId = $data['branch_id'] ?? $user->branch_id;

        $salesGoal->update([
            'user_id' => $data['user_id'],
            'month' => $data['month'],
            'unit_name' => $data['unit_name'],
            'branch_id' => $branchId,
            'unit_target' => $data['unit_target'],
            'wa_story_target' => $data['wa_story_target'] ?? 0,
            'fb_marketplace_target' => $data['fb_marketplace_target'] ?? 0,
            'tiktok_post_target' => $data['tiktok_post_target'] ?? 0,
            'new_prospect_target' => $data['new_prospect_target'] ?? 0,
            'fu_prospect_target' => $data['fu_prospect_target'] ?? 0,
        ]);

        return response()->json($salesGoal);
    }

    public function destroy(SalesGoal $salesGoal)
    {
        $salesGoal->delete();

        return response()->json(['message' => 'Goal deleted.']);
    }
}

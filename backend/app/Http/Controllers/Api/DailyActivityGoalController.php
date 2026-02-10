<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActivityGoal;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DailyActivityGoalController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $query = DailyActivityGoal::with(['user:id,name,branch_id,role', 'user.branch:id,name'])
            ->where('month', $month);

        if ($request->filled('sales_id')) {
            $query->where('user_id', $request->sales_id);
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
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'wa_story_target' => 'required|integer|min:0',
            'fb_marketplace_target' => 'required|integer|min:0',
            'tiktok_post_target' => 'required|integer|min:0',
            'new_prospect_target' => 'required|integer|min:0',
            'fu_prospect_target' => 'required|integer|min:0',
        ]);

        $goal = DailyActivityGoal::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'month' => $data['month'],
            ],
            [
                'wa_story_target' => $data['wa_story_target'],
                'fb_marketplace_target' => $data['fb_marketplace_target'],
                'tiktok_post_target' => $data['tiktok_post_target'],
                'new_prospect_target' => $data['new_prospect_target'],
                'fu_prospect_target' => $data['fu_prospect_target'],
            ]
        );

        return response()->json($goal, 201);
    }

    public function update(Request $request, DailyActivityGoal $dailyActivityGoal)
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
            'month' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'wa_story_target' => 'required|integer|min:0',
            'fb_marketplace_target' => 'required|integer|min:0',
            'tiktok_post_target' => 'required|integer|min:0',
            'new_prospect_target' => 'required|integer|min:0',
            'fu_prospect_target' => 'required|integer|min:0',
        ]);

        $dailyActivityGoal->update($data);

        return response()->json($dailyActivityGoal);
    }

    public function destroy(DailyActivityGoal $dailyActivityGoal)
    {
        $dailyActivityGoal->delete();

        return response()->json(['message' => 'Goal deleted.']);
    }
}

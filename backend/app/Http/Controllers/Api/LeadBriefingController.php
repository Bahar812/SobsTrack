<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadBriefing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadBriefingController extends Controller
{
    public function index(Request $request)
    {
        $newProspects = DB::table('new_prospects')->selectRaw(
            "id as source_id, 'new' as source_type, prospect_date, customer_name, customer_address, customer_phone, interested_unit, status, source, user_id"
        );

        $followUps = DB::table('follow_up_prospects')->selectRaw(
            "id as source_id, 'follow_up' as source_type, prospect_date, customer_name, customer_address, customer_phone, interested_unit, status, source, user_id"
        );

        $combined = $newProspects->unionAll($followUps);

        $query = DB::query()
            ->fromSub($combined, 'prospects')
            ->leftJoin('users', 'users.id', '=', 'prospects.user_id')
            ->leftJoin('branches', 'branches.id', '=', 'users.branch_id')
            ->leftJoin('lead_briefings', function ($join) {
                $join
                    ->on('lead_briefings.source_id', '=', 'prospects.source_id')
                    ->on('lead_briefings.source_type', '=', 'prospects.source_type');
            })
            ->select([
                'prospects.source_id',
                'prospects.source_type',
                'prospects.prospect_date',
                'prospects.customer_name',
                'prospects.customer_address',
                'prospects.customer_phone',
                'prospects.interested_unit',
                'prospects.status',
                'prospects.source',
                'users.id as sales_id',
                'users.name as sales_name',
                'branches.id as branch_id',
                'branches.name as branch_name',
                'lead_briefings.note as briefing_note',
            ]);

        if ($request->filled('status')) {
            $query->where('prospects.status', $request->status);
        }
        if ($request->filled('sales_id')) {
            $query->where('prospects.user_id', $request->sales_id);
        }
        if ($request->filled('branch_id')) {
            $query->where('branches.id', $request->branch_id);
        }
        if ($request->filled('name')) {
            $query->where('users.name', 'like', '%' . $request->name . '%');
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('prospects.prospect_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('prospects.prospect_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('prospects.prospect_date', '<=', $request->end_date);
        }

        return response()->json($query->orderByDesc('prospects.prospect_date')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'source_type' => 'required|in:new,follow_up',
            'source_id' => 'required|integer',
            'note' => 'nullable|string',
        ]);

        $briefing = LeadBriefing::updateOrCreate(
            [
                'source_type' => $data['source_type'],
                'source_id' => $data['source_id'],
            ],
            [
                'note' => $data['note'] ?? null,
                'created_by' => $request->user()->id,
            ]
        );

        return response()->json($briefing, 201);
    }
}

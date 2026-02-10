<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadFollowUp;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with(['sales:id,name', 'branch:id,name']);

        if ($request->filled('sales_id')) {
            $query->where('sales_id', $request->sales_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->whereDate('lead_date', $request->date);
        }

        return response()->json($query->orderByDesc('lead_date')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'lead_date' => 'required|date',
            'name' => 'required|string|max:120',
            'whatsapp' => 'required|string|max:30',
            'motor_interest' => 'required|string|max:120',
            'status' => 'required|in:new,fu,deal,cancel,prospek,hot',
        ]);

        $lead = Lead::create([
            'sales_id' => $request->user()->id,
            'branch_id' => $data['branch_id'],
            'lead_date' => $data['lead_date'],
            'name' => $data['name'],
            'whatsapp' => $data['whatsapp'],
            'motor_interest' => $data['motor_interest'],
            'status' => $data['status'],
        ]);

        return response()->json($lead, 201);
    }

    public function update(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'status' => 'required|in:new,fu,deal,cancel,prospek,hot',
            'note' => 'nullable|string',
        ]);

        $lead->update($data);
        return response()->json($lead);
    }

    public function addFollowUp(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'followup_at' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $followUp = LeadFollowUp::create([
            'lead_id' => $lead->id,
            'followup_at' => $data['followup_at'],
            'note' => $data['note'] ?? null,
        ]);

        return response()->json($followUp, 201);
    }
}

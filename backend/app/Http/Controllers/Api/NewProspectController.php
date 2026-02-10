<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewProspect;
use Illuminate\Http\Request;

class NewProspectController extends Controller
{
    public function index(Request $request)
    {
        $query = NewProspect::with('user:id,name,branch_id', 'user.branch:id,name');

        if ($request->filled('date')) {
            $query->whereDate('prospect_date', $request->date);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('prospect_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('prospect_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('prospect_date', '<=', $request->end_date);
        }
        if ($request->filled('sales_id')) {
            $query->where('user_id', $request->sales_id);
        }
        if ($request->filled('branch_id')) {
            $query->whereHas('user', function ($subQuery) use ($request) {
                $subQuery->where('branch_id', $request->branch_id);
            });
        }
        if ($request->filled('name')) {
            $query->whereHas('user', function ($subQuery) use ($request) {
                $subQuery->where('name', 'like', '%' . $request->name . '%');
            });
        }

        return response()->json($query->orderByDesc('prospect_date')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'prospect_date' => 'required|date',
            'customer_name' => 'required|string|max:120',
            'customer_address' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'interested_unit' => 'required|string|max:100',
            'status' => 'required|in:cold,hot,prospek,spk',
            'source' => 'required|in:whatsapp,ig,tiktok,iklan',
        ]);

        $record = NewProspect::create([
            'user_id' => $request->user()->id,
            ...$data,
        ]);

        $record->load('user:id,name');
        return response()->json($record, 201);
    }
}

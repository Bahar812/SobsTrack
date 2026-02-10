<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockUnit;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $query = StockUnit::with('branch:id,name');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'unit_type' => 'required|string|max:120',
            'unit_color' => 'required|string|max:80',
            'frame_no' => 'required|string|max:80',
            'engine_no' => 'required|string|max:80',
            'branch_id' => 'required|exists:branches,id',
            'status' => 'required|in:booking,available',
        ]);

        $stock = StockUnit::create($data);
        return response()->json($stock, 201);
    }

    public function update(Request $request, StockUnit $stock)
    {
        $data = $request->validate([
            'unit_type' => 'required|string|max:120',
            'unit_color' => 'required|string|max:80',
            'frame_no' => 'required|string|max:80',
            'engine_no' => 'required|string|max:80',
            'branch_id' => 'required|exists:branches,id',
            'status' => 'required|in:booking,available',
        ]);

        $stock->update($data);
        return response()->json($stock);
    }
}

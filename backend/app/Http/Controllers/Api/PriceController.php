<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use Illuminate\Http\Request;

class PriceController extends Controller
{
    public function index(Request $request)
    {
        $query = PriceList::with('branch:id,name');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json($query->orderBy('brand')->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'brand' => 'required|string|max:80',
            'unit_type' => 'required|string|max:120',
            'otr_price' => 'required|numeric|min:0',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $price = PriceList::create([
            'brand' => $data['brand'],
            'unit_type' => $data['unit_type'],
            'otr_price' => $data['otr_price'],
            'branch_id' => $data['branch_id'],
            'last_updated_at' => now(),
            'updated_by' => $request->user()->id,
        ]);

        return response()->json($price, 201);
    }

    public function update(Request $request, PriceList $price)
    {
        $data = $request->validate([
            'brand' => 'required|string|max:80',
            'unit_type' => 'required|string|max:120',
            'otr_price' => 'required|numeric|min:0',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $price->update([
            'brand' => $data['brand'],
            'unit_type' => $data['unit_type'],
            'otr_price' => $data['otr_price'],
            'branch_id' => $data['branch_id'],
            'last_updated_at' => now(),
            'updated_by' => $request->user()->id,
        ]);

        return response()->json($price);
    }
}

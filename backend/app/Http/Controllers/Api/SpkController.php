<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesTarget;
use App\Models\Spk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SpkController extends Controller
{
    public function index(Request $request)
    {
        $query = Spk::with(['sales:id,name', 'branch:id,name']);

        if ($request->filled('sales_id')) {
            $query->where('sales_id', $request->sales_id);
        }
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->filled('name')) {
            $query->whereHas('sales', function ($subQuery) use ($request) {
                $subQuery->where('name', 'like', '%' . $request->name . '%');
            });
        }
        if ($request->filled('date')) {
            $query->whereDate('spk_date', $request->date);
        }

        return response()->json($query->orderByDesc('spk_date')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sales_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'spk_no' => 'nullable|string|max:50',
            'spk_status' => 'nullable|in:spk,do',
            'customer_name' => 'required|string|max:120',
            'customer_age' => 'nullable|integer|min:0|max:120',
            'customer_gender' => 'nullable|in:laki-laki,perempuan',
            'customer_job' => 'nullable|string|max:120',
            'customer_phone' => 'nullable|string|max:30',
            'customer_address_ktp' => 'nullable|string|max:255',
            'customer_address_domisili' => 'nullable|string|max:255',
            'payment_method' => 'nullable|in:cash,kredit',
            'unit_name' => 'required|string|max:120',
            'brand' => 'nullable|string|max:120',
            'fuel_type' => 'nullable|in:bensin,listrik',
            'type' => 'nullable|string|max:120',
            'color' => 'nullable|string|max:60',
            'year' => 'nullable|integer|min:1900|max:2100',
            'unit_status' => 'nullable|in:ready,indent',
            'plan_do_date' => 'nullable|date',
            'price_otr' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'booking_fee' => 'nullable|numeric|min:0',
            'dp_gross' => 'required_if:payment_method,kredit|nullable|numeric|min:0',
            'dp_net' => 'required_if:payment_method,kredit|nullable|numeric|min:0',
            'tenor_months' => 'required_if:payment_method,kredit|nullable|integer|min:1|max:120',
            'installment' => 'required_if:payment_method,kredit|nullable|numeric|min:0',
            'leasing_name' => 'required_if:payment_method,kredit|nullable|string|max:120',
            'note' => 'nullable|string',
            'document' => 'nullable|file|max:5120',
            'spk_date' => 'required|date',
        ]);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('uploads/spk', 'public');
        }

        $spk = Spk::create([
            ...$data,
            'document_path' => $documentPath,
        ]);
        return response()->json($spk, 201);
    }

    public function update(Request $request, Spk $spk)
    {
        $data = $request->validate([
            'spk_status' => 'required|in:spk,do',
            'plan_do_date' => 'nullable|date',
        ]);

        $spk->update($data);

        return response()->json($spk);
    }

    public function summary(Request $request)
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $perSales = Spk::select('sales_id', DB::raw('COUNT(*) as total'))
            ->whereDate('spk_date', '>=', $monthStart)
            ->groupBy('sales_id')
            ->with('sales:id,name')
            ->orderByDesc('total')
            ->get();

        $targets = SalesTarget::where('target_month', now()->startOfMonth()->toDateString())
            ->with('sales:id,name')
            ->get();

        $total = $perSales->sum('total');

        return response()->json([
            'total' => $total,
            'per_sales' => $perSales,
            'targets' => $targets,
        ]);
    }
}

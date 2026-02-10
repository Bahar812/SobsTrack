<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reimbursement;
use Illuminate\Http\Request;

class ReimbursementController extends Controller
{
    public function index(Request $request)
    {
        $query = Reimbursement::where('user_id', $request->user()->id)
            ->orderByDesc('transaction_date');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'merchant_name' => 'required|string|max:150',
            'receipt_file' => 'required|image|max:5120',
        ]);

        $receiptPath = $request->file('receipt_file')->store('uploads/reimbursements', 'public');

        $reimbursement = Reimbursement::create([
            'user_id' => $request->user()->id,
            'category' => $data['category'],
            'amount' => $data['amount'],
            'transaction_date' => $data['transaction_date'],
            'merchant_name' => $data['merchant_name'],
            'receipt_path' => $receiptPath,
            'status' => 'pending',
        ]);

        return response()->json($reimbursement, 201);
    }

    public function updateStatus(Request $request, Reimbursement $reimbursement)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,paid',
        ]);

        $reimbursement->update(['status' => $data['status']]);

        return response()->json($reimbursement);
    }
}

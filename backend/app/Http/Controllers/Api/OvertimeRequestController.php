<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OvertimeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OvertimeRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = OvertimeRequest::where('user_id', $request->user()->id)
            ->orderByDesc('overtime_date');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'reason' => 'required|string|max:255',
            'proof_file' => 'nullable|file|max:5120',
        ]);

        if ($data['end_time'] <= $data['start_time']) {
            return response()->json(['message' => 'Jam selesai harus setelah jam mulai.'], 422);
        }

        $proofPath = null;
        if ($request->hasFile('proof_file')) {
            $proofPath = $request->file('proof_file')->store('uploads/overtime', 'public');
        }

        $overtime = OvertimeRequest::create([
            'user_id' => $request->user()->id,
            'overtime_date' => $data['overtime_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'reason' => $data['reason'],
            'proof_path' => $proofPath,
            'status' => 'pending',
        ]);

        return response()->json($overtime, 201);
    }

    public function updateStatus(Request $request, OvertimeRequest $overtime)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $overtime->update(['status' => $data['status']]);

        return response()->json($overtime);
    }
}

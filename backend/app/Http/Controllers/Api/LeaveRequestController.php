<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::where('user_id', $request->user()->id)
            ->orderByDesc('start_date');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string|max:50',
            'reason' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
        ]);

        if ($data['end_date'] < $data['start_date']) {
            return response()->json(['message' => 'Tanggal akhir tidak boleh sebelum tanggal awal.'], 422);
        }

        $leave = LeaveRequest::create([
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'reason' => $data['reason'] ?? null,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($leave, 201);
    }
}

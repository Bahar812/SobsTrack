<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceCleanlinessPhoto;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttendanceController extends Controller
{
    public function checkIn(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'branch_name' => 'nullable|string|max:100',
            'location_text' => 'nullable|string|max:150',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'selfie' => 'required|image|max:5120',
        ]);

        if (empty($data['branch_id']) && empty($data['branch_name'])) {
            return response()->json(['message' => 'branch_id or branch_name is required'], 422);
        }

        $branchId = $data['branch_id']
            ?? Branch::firstOrCreate(['name' => $data['branch_name']])->id;

        $path = $request->file('selfie')->store('uploads/absensi', 'public');

        $today = now()->toDateString();
        $attendance = Attendance::whereDate('attendance_date', $today)
            ->where('user_id', $request->user()->id)
            ->orderByDesc('check_in_at')
            ->first();

        if ($attendance) {
            if ($attendance->selfie_path) {
                Storage::disk('public')->delete($attendance->selfie_path);
            }
            $attendance->update([
                'branch_id' => $branchId,
                'check_in_at' => now(),
                'location_text' => $data['location_text'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'selfie_path' => $path,
            ]);
        } else {
            $attendance = Attendance::create([
                'user_id' => $request->user()->id,
                'branch_id' => $branchId,
                'attendance_date' => $today,
                'check_in_at' => now(),
                'location_text' => $data['location_text'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'selfie_path' => $path,
            ]);
        }

        $attendance->load(['user:id,name', 'branch:id,name', 'cleanlinessPhotos']);
        return response()->json($attendance, 201);
    }

    public function checkOut(Request $request)
    {
        $data = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'checkout_photo' => 'nullable|image|max:5120',
        ]);

        $attendance = Attendance::where('id', $data['attendance_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $checkoutPath = null;
        if ($request->hasFile('checkout_photo')) {
            if ($attendance->checkout_photo_path) {
                Storage::disk('public')->delete($attendance->checkout_photo_path);
            }
            $checkoutPath = $request->file('checkout_photo')->store('uploads/absensi', 'public');
        }

        $attendance->update([
            'check_out_at' => now(),
            'checkout_photo_path' => $checkoutPath ?? $attendance->checkout_photo_path,
        ]);

        $attendance->load(['user:id,name', 'branch:id,name', 'cleanlinessPhotos']);
        return response()->json($attendance);
    }

    public function uploadCleanliness(Request $request, Attendance $attendance)
    {
        $request->validate([
            'photos' => 'required|array|min:1|max:3',
            'photos.*' => 'image|max:5120',
        ]);

        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('uploads/absensi', 'public');
            AttendanceCleanlinessPhoto::create([
                'attendance_id' => $attendance->id,
                'photo_path' => $path,
            ]);
        }

        $attendance->load(['user:id,name', 'branch:id,name', 'cleanlinessPhotos']);
        return response()->json($attendance);
    }

    public function index(Request $request)
    {
        $filtered = Attendance::query();

        if ($request->filled('date')) {
            $filtered->whereDate('attendance_date', $request->date);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $filtered->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $filtered->whereDate('attendance_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $filtered->whereDate('attendance_date', '<=', $request->end_date);
        }
        if ($request->filled('sales_id')) {
            $filtered->where('user_id', $request->sales_id);
        }
        if ($request->filled('branch_id')) {
            $filtered->where('branch_id', $request->branch_id);
        }

        $latestIds = $filtered
            ->selectRaw('MAX(id) as id')
            ->groupBy('user_id', 'attendance_date');

        $query = Attendance::with(['user:id,name', 'branch:id,name', 'cleanlinessPhotos'])
            ->whereIn('id', $latestIds);

        return response()->json($query->orderByDesc('check_in_at')->paginate(20));
    }

    public function show(Attendance $attendance)
    {
        $attendance->load(['user:id,name', 'branch:id,name', 'cleanlinessPhotos']);
        return response()->json($attendance);
    }
}

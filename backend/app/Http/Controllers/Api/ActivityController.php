<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use App\Models\DailyActivityProof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ActivityController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'activity_date' => 'required|date',
            'wa_story_count' => 'required|integer|min:0',
            'fb_marketplace_count' => 'required|integer|min:0',
            'tiktok_post_count' => 'required|integer|min:0',
            'new_prospect_count' => 'required|integer|min:0',
            'fu_prospect_count' => 'required|integer|min:0',
        ]);

        $activity = DailyActivity::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'activity_date' => $data['activity_date'],
            ],
            $data
        );

        return response()->json($activity, 201);
    }

    public function addProof(Request $request, DailyActivity $activity)
    {
        if ($activity->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $data = $request->validate([
            'proof_type' => 'required|in:wa_story,fb_marketplace,tiktok,comment',
            'files' => 'nullable|array|min:1|max:10',
            'files.*' => 'image|max:5120',
            'file' => 'nullable|image|max:5120',
            'url' => 'nullable|url',
        ]);

        $maxByType = [
            'wa_story' => 1,
            'fb_marketplace' => 3,
            'tiktok' => 1,
            'comment' => 10,
        ];

        $maxAllowed = $maxByType[$data['proof_type']] ?? 1;
        $incomingFiles = $request->file('files') ?? [];
        if (empty($incomingFiles) && $request->hasFile('file')) {
            $incomingFiles = [$request->file('file')];
        }
        if (empty($incomingFiles)) {
            return response()->json(['message' => 'File bukti wajib diupload.'], 422);
        }

        $existingCount = DailyActivityProof::where('daily_activity_id', $activity->id)
            ->where('proof_type', $data['proof_type'])
            ->count();

        if ($existingCount + count($incomingFiles) > $maxAllowed) {
            return response()->json(['message' => 'Jumlah bukti melebihi batas.'], 422);
        }

        $created = [];
        foreach ($incomingFiles as $file) {
            $path = $file->store('uploads/aktivitas', 'public');
            $created[] = DailyActivityProof::create([
                'daily_activity_id' => $activity->id,
                'proof_type' => $data['proof_type'],
                'proof_path' => $path,
                'proof_url' => $data['url'] ?? null,
            ]);
        }

        return response()->json($created, 201);
    }

    public function index(Request $request)
    {
        $query = DailyActivity::with(['user:id,name,branch_id', 'user.branch:id,name', 'proofs']);

        if ($request->filled('date')) {
            $query->whereDate('activity_date', $request->date);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('activity_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('activity_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('activity_date', '<=', $request->end_date);
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

        return response()->json($query->orderByDesc('activity_date')->paginate(20));
    }

    public function stats(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $data = DailyActivity::selectRaw('activity_date, COUNT(*) as total')
            ->whereRaw("DATE_FORMAT(activity_date, '%Y-%m') = ?", [$month])
            ->groupBy('activity_date')
            ->orderBy('activity_date')
            ->get();

        return response()->json($data);
    }

    public function destroyProof(Request $request, DailyActivityProof $proof)
    {
        if ($proof->activity?->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if ($proof->proof_path) {
            Storage::disk('public')->delete($proof->proof_path);
        }

        $proof->delete();

        return response()->json(['message' => 'Bukti dihapus.']);
    }
}

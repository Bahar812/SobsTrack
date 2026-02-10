<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['branch:id,name', 'creator:id,name', 'attendees:id,name,branch_id']);

        if ($request->filled('start') && $request->filled('end')) {
            $query->whereBetween('event_start', [$request->start, $request->end]);
        }
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json($query->orderBy('event_start')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'event_start' => 'required|date',
            'event_end' => 'nullable|date',
            'location' => 'required|string|max:150',
            'branch_id' => 'required|exists:branches,id',
            'description' => 'nullable|string',
            'target' => 'nullable|string',
            'budget_file' => 'nullable|file|max:5120',
            'attendees' => 'nullable|array',
            'attendees.*' => [
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
        ]);

        $budgetPath = null;
        if ($request->hasFile('budget_file')) {
            $budgetPath = $request->file('budget_file')->store('uploads/events', 'public');
        }

        $event = Event::create([
            'name' => $data['name'],
            'event_start' => $data['event_start'],
            'event_end' => $data['event_end'] ?? null,
            'location' => $data['location'],
            'branch_id' => $data['branch_id'],
            'created_by' => $request->user()->id,
            'description' => $data['description'] ?? null,
            'target' => $data['target'] ?? null,
            'budget_file_path' => $budgetPath,
        ]);

        if ($request->has('attendees_present')) {
            $event->attendees()->sync($data['attendees'] ?? []);
        }

        $event->load(['branch:id,name', 'creator:id,name', 'attendees:id,name,branch_id']);

        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'event_start' => 'required|date',
            'event_end' => 'nullable|date',
            'location' => 'required|string|max:150',
            'branch_id' => 'required|exists:branches,id',
            'description' => 'nullable|string',
            'target' => 'nullable|string',
            'budget_file' => 'nullable|file|max:5120',
            'attendees' => 'nullable|array',
            'attendees.*' => [
                Rule::exists('users', 'id')->where('role', 'sales'),
            ],
        ]);

        $updates = [
            'name' => $data['name'],
            'event_start' => $data['event_start'],
            'event_end' => $data['event_end'] ?? null,
            'location' => $data['location'],
            'branch_id' => $data['branch_id'],
            'description' => $data['description'] ?? null,
            'target' => $data['target'] ?? null,
        ];

        if ($request->hasFile('budget_file')) {
            if ($event->budget_file_path) {
                Storage::disk('public')->delete($event->budget_file_path);
            }
            $updates['budget_file_path'] = $request->file('budget_file')->store('uploads/events', 'public');
        }

        $event->update($updates);

        if ($request->has('attendees_present')) {
            $event->attendees()->sync($data['attendees'] ?? []);
        }

        $event->load(['branch:id,name', 'creator:id,name', 'attendees:id,name,branch_id']);

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with('category:id,name');

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:document_categories,id',
            'title' => 'required|string|max:150',
            'file' => 'required|file|max:10240',
        ]);

        $path = $request->file('file')->store('uploads/dokumen', 'public');

        $doc = Document::create([
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientMimeType(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($doc, 201);
    }

    public function download(Document $document)
    {
        return Storage::disk('public')->download($document->file_path, $document->title);
    }

    public function destroy(Document $document)
    {
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

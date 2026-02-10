<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;

class DocumentCategoryController extends Controller
{
    public function index()
    {
        return response()->json(DocumentCategory::orderBy('name')->get());
    }
}

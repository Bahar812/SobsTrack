<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'file_path',
        'file_type',
        'created_by',
    ];

    protected $appends = [
        'document_url',
    ];

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getDocumentUrlAttribute()
    {
        return $this->file_path ? url(\Illuminate\Support\Facades\Storage::url($this->file_path)) : null;
    }
}

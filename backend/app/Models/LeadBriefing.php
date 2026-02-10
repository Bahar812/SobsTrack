<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadBriefing extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_type',
        'source_id',
        'note',
        'created_by',
    ];
}

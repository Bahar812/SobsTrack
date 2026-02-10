<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_type',
        'unit_color',
        'frame_no',
        'engine_no',
        'branch_id',
        'status',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'month',
        'unit_name',
        'unit_target',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}

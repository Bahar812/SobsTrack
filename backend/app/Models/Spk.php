<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Spk extends Model
{
    use HasFactory;

    protected $table = 'spk';

    protected $fillable = [
        'sales_id',
        'branch_id',
        'spk_no',
        'spk_status',
        'customer_name',
        'customer_age',
        'customer_gender',
        'customer_job',
        'customer_phone',
        'customer_address_ktp',
        'customer_address_domisili',
        'payment_method',
        'unit_name',
        'brand',
        'fuel_type',
        'type',
        'color',
        'year',
        'unit_status',
        'plan_do_date',
        'price_otr',
        'discount',
        'booking_fee',
        'dp_gross',
        'dp_net',
        'tenor_months',
        'installment',
        'leasing_name',
        'note',
        'document_path',
        'spk_date',
    ];

    protected $appends = [
        'document_url',
    ];

    public function getDocumentUrlAttribute()
    {
        return $this->document_path ? url(\Illuminate\Support\Facades\Storage::url($this->document_path)) : null;
    }

    protected $casts = [
        'spk_date' => 'date',
    ];

    public function sales()
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}

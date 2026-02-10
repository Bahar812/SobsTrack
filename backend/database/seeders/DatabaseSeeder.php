<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\DocumentCategory;
use App\Models\PriceList;
use App\Models\SalesTarget;
use App\Models\Spk;
use App\Models\StockUnit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $branchPusat = Branch::firstOrCreate(
            ['name' => 'Cabang Pusat'],
            ['address' => 'Jl. Merdeka No. 1']
        );

        $branchUtara = Branch::firstOrCreate(
            ['name' => 'Cabang Utara'],
            ['address' => 'Jl. Melati No. 10']
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@dealer.local'],
            [
                'name' => 'Admin Owner',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'branch_id' => $branchPusat->id,
                'phone' => '081200000001',
            ]
        );

        $salesAndi = User::updateOrCreate(
            ['email' => 'andi@dealer.local'],
            [
                'name' => 'Sales Andi',
                'password' => Hash::make('password'),
                'role' => 'sales',
                'branch_id' => $branchPusat->id,
                'phone' => '081200000002',
            ]
        );

        $salesRina = User::updateOrCreate(
            ['email' => 'rina@dealer.local'],
            [
                'name' => 'Sales Rina',
                'password' => Hash::make('password'),
                'role' => 'sales',
                'branch_id' => $branchUtara->id,
                'phone' => '081200000003',
            ]
        );

        $leader = User::updateOrCreate(
            ['email' => 'leader@dealer.local'],
            [
                'name' => 'Leader Area',
                'password' => Hash::make('password'),
                'role' => 'leader',
                'branch_id' => $branchPusat->id,
                'phone' => '081200000004',
            ]
        );

        $categories = [
            'Brosur Motor',
            'Pricelist',
            'Form SPK',
            'SOP Sales',
            'Harga OTR',
            'Stok Unit',
        ];

        foreach ($categories as $name) {
            DocumentCategory::firstOrCreate(['name' => $name]);
        }

        PriceList::updateOrCreate(
            ['brand' => 'Yamaha', 'unit_type' => 'NMAX 155', 'branch_id' => $branchPusat->id],
            [
                'otr_price' => 32000000,
                'last_updated_at' => now(),
                'updated_by' => $admin->id,
            ]
        );

        PriceList::updateOrCreate(
            ['brand' => 'Honda', 'unit_type' => 'PCX 160', 'branch_id' => $branchPusat->id],
            [
                'otr_price' => 34000000,
                'last_updated_at' => now(),
                'updated_by' => $admin->id,
            ]
        );

        StockUnit::updateOrCreate(
            ['frame_no' => 'FRM-001', 'engine_no' => 'ENG-001'],
            [
                'unit_type' => 'NMAX 155',
                'unit_color' => 'Hitam',
                'branch_id' => $branchPusat->id,
                'status' => 'available',
            ]
        );

        StockUnit::updateOrCreate(
            ['frame_no' => 'FRM-002', 'engine_no' => 'ENG-002'],
            [
                'unit_type' => 'PCX 160',
                'unit_color' => 'Putih',
                'branch_id' => $branchPusat->id,
                'status' => 'booking',
            ]
        );

        Spk::updateOrCreate(
            ['spk_no' => 'SPK-001'],
            [
                'sales_id' => $salesAndi->id,
                'branch_id' => $branchPusat->id,
                'customer_name' => 'Budi Santoso',
                'unit_name' => 'NMAX 155',
                'spk_date' => now()->toDateString(),
            ]
        );

        Spk::updateOrCreate(
            ['spk_no' => 'SPK-002'],
            [
                'sales_id' => $salesRina->id,
                'branch_id' => $branchUtara->id,
                'customer_name' => 'Siti Aminah',
                'unit_name' => 'PCX 160',
                'spk_date' => now()->toDateString(),
            ]
        );

        SalesTarget::updateOrCreate(
            [
                'sales_id' => $salesAndi->id,
                'target_month' => now()->startOfMonth()->toDateString(),
            ],
            ['target_count' => 10]
        );

        SalesTarget::updateOrCreate(
            [
                'sales_id' => $salesRina->id,
                'target_month' => now()->startOfMonth()->toDateString(),
            ],
            ['target_count' => 8]
        );
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->unsignedTinyInteger('customer_age')->nullable()->after('customer_name');
            $table->string('customer_phone', 30)->nullable()->after('customer_age');
            $table->string('customer_address_ktp', 255)->nullable()->after('customer_phone');
            $table->string('customer_address_domisili', 255)->nullable()->after('customer_address_ktp');
            $table->enum('payment_method', ['cash', 'kredit'])->nullable()->after('customer_address_domisili');

            $table->string('brand', 120)->nullable()->after('unit_name');
            $table->enum('fuel_type', ['bensin', 'listrik'])->nullable()->after('brand');
            $table->string('type', 120)->nullable()->after('fuel_type');
            $table->string('color', 60)->nullable()->after('type');
            $table->unsignedSmallInteger('year')->nullable()->after('color');
            $table->enum('unit_status', ['ready', 'indent'])->nullable()->after('year');
            $table->date('plan_do_date')->nullable()->after('unit_status');

            $table->decimal('price_otr', 15, 2)->nullable()->after('plan_do_date');
            $table->decimal('discount', 15, 2)->nullable()->after('price_otr');
            $table->decimal('booking_fee', 15, 2)->nullable()->after('discount');

            $table->decimal('dp_gross', 15, 2)->nullable()->after('booking_fee');
            $table->decimal('dp_net', 15, 2)->nullable()->after('dp_gross');
            $table->unsignedSmallInteger('tenor_months')->nullable()->after('dp_net');
            $table->decimal('installment', 15, 2)->nullable()->after('tenor_months');
            $table->string('leasing_name', 120)->nullable()->after('installment');
        });
    }

    public function down(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->dropColumn([
                'customer_age',
                'customer_phone',
                'customer_address_ktp',
                'customer_address_domisili',
                'payment_method',
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
            ]);
        });
    }
};

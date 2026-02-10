<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(Branch::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
        ]);

        $branch = Branch::create($data);
        return response()->json($branch, 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
        ]);

        $branch->update($data);
        return response()->json($branch);
    }

    public function destroy(Branch $branch)
    {
        $primaryBranch = Branch::firstOrCreate(['name' => 'Cabang Pusat'], ['address' => null]);
        if ($primaryBranch->id === $branch->id) {
            return response()->json(['message' => 'Cabang pusat tidak bisa dihapus.'], 422);
        }

        try {
            DB::transaction(function () use ($branch, $primaryBranch) {
                $primaryId = $primaryBranch->id;
                $branchId = $branch->id;

                DB::table('users')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('events')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('attendances')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('leads')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('spk')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('stock_units')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('price_lists')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);
                DB::table('sales_goals')->where('branch_id', $branchId)->update(['branch_id' => $primaryId]);

                $branchGoals = DB::table('branch_goals')->where('branch_id', $branchId)->get();
                foreach ($branchGoals as $goal) {
                    $existing = DB::table('branch_goals')
                        ->where('branch_id', $primaryId)
                        ->where('month', $goal->month)
                        ->where('unit_name', $goal->unit_name)
                        ->first();
                    if ($existing) {
                        DB::table('branch_goals')
                            ->where('id', $existing->id)
                            ->update(['unit_target' => $existing->unit_target + $goal->unit_target]);
                        DB::table('branch_goals')->where('id', $goal->id)->delete();
                    } else {
                        DB::table('branch_goals')->where('id', $goal->id)->update(['branch_id' => $primaryId]);
                    }
                }

                $branch->delete();
            });
        } catch (QueryException $exception) {
            return response()->json(
                ['message' => 'Gagal menghapus cabang karena masih ada data terkait.'],
                422
            );
        }

        return response()->json(['message' => 'Branch deleted']);
    }
}

export default function Stok() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Stok Unit Motor</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Filter berdasarkan cabang & status</p>
          </div>
          <div className="flex gap-2">
            <input className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm" placeholder="Cabang" />
            <input className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm" placeholder="Status" />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">No</th>
                <th className="py-2">Type</th>
                <th className="py-2">Warna</th>
                <th className="py-2">Rangka</th>
                <th className="py-2">Mesin</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {[
                { id: 1, type: 'NMAX 155', color: 'Hitam', frame: 'FRM-001', engine: 'ENG-001', branch: 'Cabang Pusat', status: 'Available' },
                { id: 2, type: 'PCX 160', color: 'Putih', frame: 'FRM-002', engine: 'ENG-002', branch: 'Cabang Pusat', status: 'Booking' },
              ].map((row) => (
                <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3">{row.id}</td>
                  <td className="py-3">{row.type}</td>
                  <td className="py-3">{row.color}</td>
                  <td className="py-3">{row.frame}</td>
                  <td className="py-3">{row.engine}</td>
                  <td className="py-3">{row.branch}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${row.status === 'Available' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' : 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-200'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

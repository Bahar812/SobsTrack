export default function Harga() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">Harga Motor OTR</h3>
          <button className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">
            Update Harga
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Brand</th>
                <th className="py-2">Tipe</th>
                <th className="py-2">OTR</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {[
                { brand: 'Yamaha', type: 'NMAX 155', price: 'Rp 32.000.000', branch: 'Cabang Pusat', updated: '13 Jan 2026' },
                { brand: 'Honda', type: 'PCX 160', price: 'Rp 34.000.000', branch: 'Cabang Pusat', updated: '13 Jan 2026' },
              ].map((row) => (
                <tr key={row.type} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3">{row.brand}</td>
                  <td className="py-3">{row.type}</td>
                  <td className="py-3 text-emerald-700 dark:text-emerald-200">{row.price}</td>
                  <td className="py-3">{row.branch}</td>
                  <td className="py-3">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

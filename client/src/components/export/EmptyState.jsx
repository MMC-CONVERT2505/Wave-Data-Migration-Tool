import { FileSearch } from 'lucide-react'

export default function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
            <FileSearch className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-heading font-semibold text-slate-800 mb-1.5">
            No invoices found
          </h3>
          <p className="text-sm text-slate-400 font-body text-center max-w-xs leading-relaxed">
            No records match your selected date range. Try adjusting the filters or clearing them to view all invoices.
          </p>
        </div>
      </td>
    </tr>
  );
}

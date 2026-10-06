import { Loader2 } from 'lucide-react'

export default function LoadingState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
          <h3 className="text-base font-heading font-semibold text-slate-800 mb-1.5">
            Loading invoices…
          </h3>
          <p className="text-sm text-slate-400 font-body text-center max-w-xs leading-relaxed">
            Please wait while we fetch your invoices. This may take a few seconds.
          </p>
        </div>
      </td>
    </tr>
  );
}

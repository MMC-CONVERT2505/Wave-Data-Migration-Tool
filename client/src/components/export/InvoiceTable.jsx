import React from 'react'
import { Download, FileJson, Loader2 } from 'lucide-react'

const InvoiceTable = ({ invoiceData, businessId, downloadExcel, downloadJson, isDownloading }) => {

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">Invoices</h2>
                    <p className="text-xs text-slate-400 font-body mt-1">
                        {invoiceData?.length} records found
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold font-body px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {invoiceData?.length} total
                    </span>

                    <button
                        onClick={downloadExcel}
                        disabled={isDownloading}
                        aria-busy={isDownloading}
                        className="flex items-center gap-1.5 text-xs font-semibold font-heading px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors min-w-[92px] justify-center"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Downloading…
                            </>
                        ) : (
                            <>
                                <Download className="w-3.5 h-3.5" />
                                Excel
                            </>
                        )}
                    </button>

                    <button
                        onClick={downloadJson}
                        className="flex items-center gap-1.5 text-xs font-semibold font-heading px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <FileJson className="w-3.5 h-3.5" />
                        JSON
                    </button>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {["Invoice ID", "Status", "Invoice date", "Due date", "Customer"].map((col) => (
                                <th
                                    key={col}
                                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 font-body"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {invoiceData?.map((inv) => {
                            const invoice = inv.node;
                            const statusColor = {
                                PAID: "text-emerald-600",
                                OVERDUE: "text-red-500",
                                SENT: "text-indigo-600",
                                DRAFT: "text-slate-400",
                                VIEWED: "text-emerald-500",
                            }[invoice.status] || "text-slate-500";

                            return (
                                <tr
                                    key={invoice.id}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-indigo-600">
                                        {invoice.id.slice(0, 10)}
                                    </td>
                                    <td className={`px-4 py-2.5 text-sm font-medium font-body ${statusColor}`}>
                                        {invoice.status}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-slate-500 font-body">
                                        {invoice.invoiceDate}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-slate-500 font-body">
                                        {invoice.dueDate}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-slate-700 font-body">
                                        {invoice.customer?.name || "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-4 text-xs text-slate-400 font-body">
                <span>Showing {invoiceData?.length} invoices</span>
                <span>Updated just now</span>
            </div>
        </div>
    );
}

export default InvoiceTable

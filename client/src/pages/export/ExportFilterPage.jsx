import { API_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Filter, Download, FileJson, ChevronDown, ArrowLeft, Building2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import EmptyState from "../../components/export/EmptyState";
import InvoiceTable from '../../components/export/InvoiceTable';
import LoadingState from '../../components/export/Loader';
import { downloadInvoicesExcel } from '../../utils/exportExcel';

function getStoredBusiness() {
    try { return JSON.parse(sessionStorage.getItem('selectedBusiness')); } catch { return null; }
}

const ExportFilterPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Legacy flow: user manually connected via BusinessList and arrived with state.
    const stateBusinessId = location.state?.businessId;
    const stateApiToken = location.state?.apiToken;

    const storedBusiness = getStoredBusiness();

    const [useDifferentAccount, setUseDifferentAccount] = useState(!!stateBusinessId && !storedBusiness);
    const [manualApiToken, setManualApiToken] = useState(stateApiToken || "");
    const [manualBusinessId, setManualBusinessId] = useState(stateBusinessId || "");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [invoiceData, setInvoiceData] = useState([]);

    const activeBusinessId = useDifferentAccount ? manualBusinessId : (storedBusiness?.id || stateBusinessId || "");
    const activeBusinessName = useDifferentAccount ? null : (storedBusiness?.name || null);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        } catch { /* ignore */ }
        sessionStorage.removeItem('selectedBusiness');
        navigate('/');
    };

    useEffect(() => {
        if (!activeBusinessId && !useDifferentAccount) {
            // Koi business connected nahi hai — manual override khud-ba-khud khul jaye
            setUseDifferentAccount(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildPayload = () => {
        const payload = {
            start_date: startDate,
            end_date: endDate,
            business_id: activeBusinessId,
        };
        if (useDifferentAccount && manualApiToken.trim()) {
            payload.api_token = manualApiToken.trim();
        }
        return payload;
    };

    const applyFilter = async () => {
        if (!activeBusinessId) {
            toast.error("Select a business or enter a Business ID first.", { position: "top-center" });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/export/filter`,
                buildPayload(),
                { withCredentials: true }
            );
            toast.success("Invoices loaded successfully!", { position: "top-center" });
            setInvoiceData(res.data.edges);
        } catch (err) {
            toast.error(err.response?.data?.message || "No invoices found in selected range", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    // Excel ab frontend pe hi banta hai — filter se aaya invoiceData use hota hai,
    // backend ko dobara call nahi karna padta.
    const downloadExcel = () => {
        if (isDownloading) return; // pehle se download chal raha hai to dobara trigger na ho
        if (!invoiceData?.length) {
            toast.error("No invoices to export. Apply filter first.", { position: "top-center" });
            return;
        }
        setIsDownloading(true);
        try {
            const shortBusinessId = (activeBusinessId || "export").slice(0, 15);
            downloadInvoicesExcel(invoiceData, `${shortBusinessId}_wave_invoices.xlsx`);
            toast.success("Excel file downloaded successfully!", { position: "top-center" });
        } catch {
            toast.error("Failed to generate Excel file!", { position: "top-center" });
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadJson = async () => {
        try {
            const totalNodes = invoiceData?.length || 0;
            const finalData = { businessId: activeBusinessId, totalNodes, data: invoiceData };
            const jsonString = JSON.stringify(finalData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const shortBusinessId = (activeBusinessId || "export").slice(0, 15);
            a.download = `${shortBusinessId}-invoiceData.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("JSON data downloaded successfully!", { position: "top-center" });
        } catch {
            toast.error("Failed to download JSON data!", { position: "top-center" });
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            <Sidebar selectedBusiness={activeBusinessName ? { name: activeBusinessName } : null} onLogout={handleLogout} />

            <main className="flex-1 px-6 sm:px-10 py-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-heading font-bold text-slate-900">Export invoice data</h1>
                        <p className="text-sm text-slate-500 font-body mt-0.5">
                            {activeBusinessName
                                ? "Uses your active connection by default."
                                : "Filter by date range and download as Excel or JSON."}
                        </p>
                    </div>
                    {activeBusinessName && (
                        <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium font-body px-3 py-1.5 rounded-full">
                            <Building2 className="w-3.5 h-3.5" />
                            Connected · {activeBusinessName}
                        </span>
                    )}
                </div>

                {/* ── Filter Panel ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-7 shadow-sm shadow-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide font-body">Start date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide font-body">End date</label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={applyFilter}
                                disabled={!startDate || !endDate || loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold font-heading py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                {loading ? "Loading…" : "Apply filter"}
                            </button>
                        </div>
                    </div>

                    {/* ── Optional manual account override ── */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-semibold text-slate-700 font-body">
                                Use a different Wave account <span className="text-slate-400 font-normal">(optional)</span>
                            </span>
                            <input
                                type="checkbox"
                                checked={useDifferentAccount}
                                onChange={(e) => setUseDifferentAccount(e.target.checked)}
                                className="w-4 h-4 accent-indigo-600"
                            />
                        </label>
                        <p className="text-xs text-slate-400 font-body mt-1.5">
                            Leave off to export from the account you're already signed in to. Toggle on to enter another API token and Business ID manually.
                        </p>

                        {useDifferentAccount && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-body">Wave API token</label>
                                    <input
                                        type="password"
                                        value={manualApiToken}
                                        onChange={e => setManualApiToken(e.target.value)}
                                        placeholder="Paste your Wave API token"
                                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-body">Business ID</label>
                                    <input
                                        type="text"
                                        value={manualBusinessId}
                                        onChange={e => setManualBusinessId(e.target.value)}
                                        placeholder="Enter Wave Business ID"
                                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Results ── */}
                {loading ? (
                    <table className="w-full"><tbody><LoadingState /></tbody></table>
                ) : invoiceData?.length === 0 ? (
                    <table className="w-full"><tbody><EmptyState /></tbody></table>
                ) : (
                    <InvoiceTable
                        invoiceData={invoiceData}
                        downloadJson={downloadJson}
                        downloadExcel={downloadExcel}
                        isDownloading={isDownloading}
                        businessId={activeBusinessId}
                    />
                )}
            </div>
            </main>
        </div>
    );
};

export default ExportFilterPage;

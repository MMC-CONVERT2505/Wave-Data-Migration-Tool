import { API_URL } from '../config';
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Upload, ArrowLeft, Zap,
  CheckCircle2, XCircle, AlertTriangle,
  CreditCard, RefreshCw, ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import StepIndicator from "../components/StepIndicator";
import Toast from "../components/Toast";

/* ── Constants ─────────────────────────────────────────────────── */
const STEPS         = ["Upload", "Preview", "Results"];
const REQUIRED_COLS = ["invoice_number", "payment_date", "amount"];
const OPTIONAL_COLS = ["paymentAccountId", "skip", "payment_method", "exchangeRate", "memo"];
const VALID_METHODS = ["BANK_TRANSFER", "CASH", "CHEQUE", "CREDIT_CARD", "OTHER", "PAYPAL", "UNSPECIFIED"];

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -10, filter: "blur(2px)", transition: { duration: 0.25 } },
};

function validateRow(row, idx) {
  const errors   = [];
  const warnings = [];
  if (!row.invoice_number)   errors.push("invoice_number missing");
  if (!row.payment_date)     errors.push("payment_date missing");
  if (!row.amount || isNaN(parseFloat(row.amount))) errors.push("amount missing or invalid");
  const method = String(row.payment_method || "").toUpperCase();
  if (method && !VALID_METHODS.includes(method))
    warnings.push(`payment_method "${row.payment_method}" invalid — UNSPECIFIED use hoga`);
  return { ...row, _rowRef: row.invoice_number || `row_${idx}`, _errors: errors, _warnings: warnings };
}

export default function Payment({ selectedBusiness }) {
  const navigate = useNavigate();

  const [step, setStep]             = useState(1);
  const [parsedRows, setParsedRows] = useState([]);
  const [excelData, setExcelData]   = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [importing, setImporting]   = useState(false);
  const [results, setResults]       = useState([]);
  const [filterTab, setFilterTab]   = useState("all");
  const [toast, setToast]           = useState(null);

  // Payment accounts — normal user ko raw Wave accountId manually fetch/paste
  // nahi karna padta, seedha naam se dropdown se select kar sakta hai.
  const [accounts, setAccounts]           = useState([]);
  const [defaultAccountId, setDefaultAccountId] = useState("");

  useEffect(() => {
    if (!selectedBusiness?.id) return;
    fetch(`${API_URL}/api/payments/${selectedBusiness.id}/accounts`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, [selectedBusiness?.id]);

  /* ── File parse ───────────────────────────────────────────────── */
  const processFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb      = XLSX.read(evt.target?.result, { type: "binary" });
      const ws      = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });

      const isHeader = (r) => r.some((v) => String(v).toLowerCase().replace(/[\s*]/g, "").includes("invoicenumber"));
      let hIdx = allRows.findIndex(isHeader);
      if (hIdx === -1) hIdx = 0;

      const headers  = allRows[hIdx].map((h) => String(h).trim().replace(/\s?\*$/, ""));
      const dataRows = allRows.slice(hIdx + 1)
        .filter((r) => r.some((v) => v !== "" && v !== null && v !== undefined))
        .map((r)  => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));

      const formatDate = (val) => {
        if (!val) return "";
        if (typeof val === "number") {
          const d = XLSX.SSF.parse_date_code(val);
          return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
        }
        const s = String(val).trim();
        const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
        return s;
      };

      const validated = dataRows.map((row, i) => validateRow({
        ...row,
        payment_date: formatDate(row.payment_date),
        amount:       row.amount !== "" ? String(row.amount) : "",
      }, i));

      setParsedRows(validated);
      setExcelData({ fileName: file.name });
      setStep(2);
      setToast({ message: `${file.name} — ${validated.length} rows loaded`, type: "success" });
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleFileInput = (e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) processFile(f);
  };

  /* ── Import ───────────────────────────────────────────────────── */
  const handleImport = async () => {
    const valid = parsedRows.filter((r) => r._errors.length === 0);
    if (!valid.length) return;

    const isRowSkipped = (r) => {
      const flag = String(r.skip || "").trim().toLowerCase();
      return ["yes", "y", "true", "1"].includes(flag)
        || String(r.paymentAccountId || "").trim().toUpperCase() === "SKIP";
    };

    const missingAccount = valid.some((r) => !isRowSkipped(r) && !r.paymentAccountId && !defaultAccountId);
    if (missingAccount) {
      setToast({
        message: "Kuch rows me payment account nahi hai — neeche se ek default account select karo ya sheet me bhar do.",
        type: "error",
      });
      return;
    }

    setImporting(true);
    try {
      const res  = await fetch(`${API_URL}/api/payments/bulk-excel`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ businessId: selectedBusiness?.id, payments: valid, defaultAccountId }),
      });
      const data = await res.json();
      setResults(data.results);
      setStep(3);
    } catch (err) {
      setToast({ message: `Import failed: ${err.message}`, type: "error" });
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  const reset = () => { setStep(1); setParsedRows([]); setExcelData(null); setResults([]); setFilterTab("all"); };

  /* ── Derived ───────────────────────────────────────────────────── */
  const validRows = parsedRows.filter((r) => r._errors.length === 0);
  const errorRows = parsedRows.filter((r) => r._errors.length > 0);
  const warnRows  = parsedRows.filter((r) => r._warnings.length > 0);
  const filtered  = parsedRows.filter((r) => {
    if (filterTab === "ready")    return r._errors.length === 0;
    if (filterTab === "errors")   return r._errors.length > 0;
    if (filterTab === "warnings") return r._warnings.length > 0;
    return true;
  });
  const successResults = results.filter((r) => r.success);
  const skippedResults = results.filter((r) => r.skipped);
  const failResults    = results.filter((r) => !r.success && !r.skipped);

  /* ── No business guard ─────────────────────────────────────────── */
  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 border border-slate-200" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-heading font-bold text-slate-700 mb-1">No business selected</p>
          <p className="text-slate-400 text-sm mb-4">Go to the Dashboard and select a business first.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-heading font-bold mx-auto hover:bg-brand-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body flex">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes scaleIn { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      <Sidebar selectedBusiness={selectedBusiness} onLogout={handleLogout} />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <main className="flex-1 max-w-4xl mx-auto px-6 pt-10 pb-24">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900">Record Payments</h1>
            <p className="text-slate-400 text-sm">Bulk import payments from Excel into Wave</p>
          </div>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Upload ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="p1" variants={pageVariants} initial="initial" animate="animate" exit="exit">

              {/* Template hint */}
              <div className="bg-brand-light border border-brand-200 rounded-2xl p-5 mb-6">
                <p className="text-sm font-heading font-bold text-brand-700 mb-3">Excel template columns:</p>
                <div className="flex flex-wrap gap-2">
                  {REQUIRED_COLS.map((c) => (
                    <span key={c} className="text-xs bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full font-mono font-semibold border border-brand-200">
                      {c} *
                    </span>
                  ))}
                  {OPTIONAL_COLS.map((c) => (
                    <span key={c} className="text-xs bg-white text-brand-500 px-2.5 py-1 rounded-full font-mono border border-brand-200">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-brand-500 mt-3">
                  payment_method values: {VALID_METHODS.join(" · ")}
                </p>
                <p className="text-xs text-brand-500 mt-1">
                  Kisi row ko sheet me rakhna hai par Wave par push nahi karna — us row ke <span className="font-mono">skip</span> column me{" "}
                  <span className="font-mono">yes</span> likh do (ya <span className="font-mono">paymentAccountId</span> me{" "}
                  <span className="font-mono">SKIP</span>).
                </p>
              </div>

              {/* Default payment account — normal user ko raw Wave accountId
                  manually fetch karke sheet me paste nahi karna padta */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
                <label className="block text-sm font-heading font-bold text-slate-700 mb-1.5">
                  Default payment account
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Sheet ke <span className="font-mono">paymentAccountId</span> column ko khali chhod sakte ho — ye account
                  un sab rows me use hoga. Kisi row ke liye alag account chahiye to us row me account ka <b>naam</b> likh do
                  (raw ID zaroori nahi).
                </p>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-body bg-white"
                >
                  <option value="">— Select an account —</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p className="text-xs text-amber-500 mt-2">
                    Accounts load ho rahe hain… agar list khali rahe to business connection check karo.
                  </p>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById("pay-file-input").click()}
                className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
                  dragOver ? "border-brand-500 bg-brand-light scale-[1.01]" : "bg-white hover:bg-slate-50 hover:border-brand-400 border-slate-200"
                }`}
              >
                <input id="pay-file-input" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} />
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-brand-600" : "bg-brand-light"}`}
                    style={{ animation: "float 3s ease-in-out infinite" }}
                  >
                    <UploadCloud className={`w-8 h-8 ${dragOver ? "text-white" : "text-brand-600"}`} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-slate-800 text-lg mb-1">
                      {dragOver ? "Release to upload" : "Drop your payment Excel file here"}
                    </p>
                    <p className="text-slate-400 text-sm">Supports .xlsx and .xls formats</p>
                  </div>
                  <button className="border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-sm font-heading font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Browse Files
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Preview ─────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="p2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-heading font-bold text-slate-900">Preview & Confirm</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{excelData?.fileName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-heading font-medium transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!validRows.length || importing}
                    className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-heading font-bold disabled:opacity-40 hover:bg-brand-700 active:scale-95 transition-all"
                    style={{ boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
                  >
                    {importing
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                      : <><Zap className="w-4 h-4" /> Import {validRows.length} Payments</>}
                  </button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Total",   value: parsedRows.length, color: "text-slate-700",   bg: "bg-slate-50 border-slate-200" },
                  { label: "Ready",   value: validRows.length,  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
                  { label: "Errors",  value: errorRows.length,  color: "text-red-600",     bg: "bg-red-50 border-red-100" },
                ].map((s) => (
                  <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
                    <p className={`text-3xl font-heading font-extrabold ${s.color}`}>{s.value}</p>
                    <p className={`text-xs font-heading font-semibold mt-1 ${s.color} opacity-70`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1.5 mb-4">
                {[
                  { key: "all",      label: `All (${parsedRows.length})` },
                  { key: "ready",    label: `Ready (${validRows.length})` },
                  { key: "errors",   label: `Errors (${errorRows.length})` },
                  { key: "warnings", label: `Warnings (${warnRows.length})` },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setFilterTab(key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-heading font-semibold transition-all ${
                      filterTab === key ? "bg-brand-600 text-white shadow-brand-sm" : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Rows list */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {filtered.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-5 py-3.5 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} border-b border-slate-100 last:border-0 hover:bg-indigo-50/30 transition-colors`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${row._errors.length ? "bg-red-400" : row._warnings.length ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span className="text-sm font-mono font-medium text-slate-700 flex-shrink-0">#{row.invoice_number}</span>
                    <span className="text-xs font-mono text-slate-400">{row.payment_date}</span>
                    <span className="text-sm font-mono font-semibold text-slate-800 ml-auto">${parseFloat(row.amount || 0).toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-heading">{row.payment_method || "UNSPECIFIED"}</span>
                    {row._errors.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-heading font-medium truncate max-w-[160px]">
                        {row._errors[0]}
                      </span>
                    )}
                    {row._errors.length === 0 && row._warnings.length > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-heading font-medium truncate max-w-[160px]">
                        {row._warnings[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Results ─────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="p3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4"
                  style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-slate-900 mb-1">
                  {failResults.length === 0 ? "Payments Complete!" : "Import Complete"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {successResults.length} successful · {failResults.length} failed{skippedResults.length ? ` · ${skippedResults.length} skipped` : ""}
                </p>
              </div>

              <div className={`grid gap-4 mb-6 ${skippedResults.length ? "grid-cols-3" : "grid-cols-2"}`}>
                {[
                  { label: "Successful", value: successResults.length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                  { label: "Failed",     value: failResults.length,    color: "text-red-500",     bg: "bg-red-50 border-red-100"     },
                  ...(skippedResults.length
                    ? [{ label: "Skipped", value: skippedResults.length, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" }]
                    : []),
                ].map((s) => (
                  <div key={s.label} className={`border rounded-2xl p-6 text-center ${s.bg}`}>
                    <p className={`text-4xl font-heading font-extrabold ${s.color}`}>{s.value}</p>
                    <p className={`text-sm font-heading font-semibold mt-1 ${s.color} opacity-80`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Success list */}
              {successResults.length > 0 && (
                <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden mb-3">
                  <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                    <p className="text-sm font-heading font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Successfully Recorded ({successResults.length})
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {successResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-sm font-mono text-slate-700">Invoice #{r.invoiceNumber || r.rowRef}</span>
                        {r.customer && <span className="text-xs text-slate-400">· {r.customer}</span>}
                        {r.amount && <span className="ml-auto text-sm font-mono font-semibold text-emerald-600">${parseFloat(r.amount).toFixed(2)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fail list */}
              {failResults.length > 0 && (
                <div className="bg-white border border-red-100 rounded-2xl overflow-hidden mb-6">
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                    <p className="text-sm font-heading font-bold text-red-700 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Failed ({failResults.length})
                    </p>
                  </div>
                  <div className="divide-y divide-red-50 max-h-60 overflow-y-auto">
                    {failResults.map((r, i) => (
                      <div key={i} className="px-5 py-3">
                        <p className="text-sm font-mono text-slate-700">Invoice #{r.invoiceNumber || r.rowRef}</p>
                        {r.errors?.map((e, j) => (
                          <p key={j} className="text-xs text-red-500 mt-0.5">{e.message}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={reset} className="flex items-center gap-2 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all">
                  <Upload className="w-4 h-4" /> New Import
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-heading font-bold hover:bg-brand-700 transition-all"
                  style={{ boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
                >
                  Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
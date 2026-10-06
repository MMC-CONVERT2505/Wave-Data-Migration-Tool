
// import { useState, useEffect, useRef, useCallback } from 'react';
// import * as XLSX from 'xlsx';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Upload, UploadCloud, ChevronRight, AlertTriangle,
//   FileSpreadsheet, ArrowLeft, Zap,
// } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import StepIndicator from '../components/StepIndicator';
// import ImportResults from '../components/ImportResults';
// import Toast from '../components/Toast';

// const PASTEL_COLORS = [
//   'bg-indigo-100 text-indigo-700',
//   'bg-emerald-100 text-emerald-700',
//   'bg-amber-100 text-amber-700',
//   'bg-rose-100 text-rose-700',
//   'bg-cyan-100 text-cyan-700',
//   'bg-violet-100 text-violet-700',
// ];

// function getInitialColor(name) {
//   const idx = name.charCodeAt(0) % PASTEL_COLORS.length;
//   return PASTEL_COLORS[idx];
// }

// const REQUIRED_COLS = ['customer_name *', 'invoice_date *', 'product_name *', 'quantity *', 'unit_price *'];
// const OPTIONAL_COLS = ['invoice_ref', 'invoice_number', 'status', 'currency_code', 'exchange_rate', 'due_date', 'memo', 'poNumber', 'item_description', 'item_tax_name', 'item_tax_amount', 'discount_amount', 'discount_name', 'discount_type', 'discount_percentage'];

// const pageVariants = {
//   initial: { opacity: 0, y: 16 },
//   animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
//   exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
// };

// export default function Dashboard({ onBusinessSelect } = {}) {
//   const [businesses, setBusinesses]     = useState([]);
//   const [selectedBusiness, setSelectedBusiness] = useState(null);
//   const [customers, setCustomers]       = useState([]);
//   const [products, setProducts]         = useState([]);
//   const [excelData, setExcelData]       = useState(null);
//   const [parsedInvoices, setParsedInvoices] = useState([]);
//   const [importing, setImporting]       = useState(false);
//   const [results, setResults]           = useState(null);
//   const [loading, setLoading]           = useState(true);
//   const [step, setStep]                 = useState(1);
//   const [dragOver, setDragOver]         = useState(false);
//   const [filterTab, setFilterTab]       = useState('all');
//   const [toast, setToast]               = useState(null);
//   const [pendingRows, setPendingRows]   = useState(null);
//   const fileRef = useRef(null);

//   useEffect(() => {
//     fetch(`${API_URL}/api/businesses`, { credentials: 'include' })
//       .then((r) => r.json())
//       .then((data) => {
//         if (data.error) { window.location.href = '/'; return; }
//         setBusinesses(data);
//         setLoading(false);
//       })
//       .catch(() => { window.location.href = '/'; });
//   }, []);

//   useEffect(() => {
//     if (!selectedBusiness) return;
//     Promise.all([
//       fetch(`${API_URL}/api/businesses/${selectedBusiness.id}/customers`, { credentials: 'include' }).then((r) => r.json()),
//       fetch(`${API_URL}/api/businesses/${selectedBusiness.id}/products`,  { credentials: 'include' }).then((r) => r.json()),
//     ]).then(([c, p]) => {
//       setCustomers(Array.isArray(c) ? c : []);
//       setProducts(Array.isArray(p) ? p : []);
//     });
//   }, [selectedBusiness]);

//   // Jab customers/products load ho jaayein aur pending rows hon toh parse karo
//   useEffect(() => {
//     if (pendingRows && customers.length >= 0 && products.length >= 0) {
//       parseInvoices(pendingRows);
//       setPendingRows(null);
//     }
//   }, [customers, products, pendingRows]);

//   const findCustomerId = useCallback((name) => {
//     if (!name) return null;
//     console.log(customers)
//     return customers.find((c) => c.name?.toLowerCase().trim() === name?.toLowerCase().trim())?.id || null;
//   }, [customers]);

//   const findProductId = useCallback((name) => {
//     if (!name) return null;
//     return products.find((p) => p.name?.toLowerCase().trim() === name?.toLowerCase().trim())?.id || null;
//   }, [products]);

//   const formatDate = (val) => {
//     if (!val) return null;
//     if (typeof val === 'number') {
//       const date = XLSX.SSF.parse_date_code(val);
//       return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
//     }
//     const s = String(val).trim();
//     return s || null;
//   };

//   // ─── Parse Excel rows → Wave invoice format ──────────────────────
//   const parseInvoices = useCallback((rows) => {
//     console.log('parseInvoices called — rows:', rows.length, 'customers:', customers.length, 'products:', products.length);
//     console.log('First row sample:', rows[0]);
//     const invoiceMap = {};

//     rows.forEach((row, idx) => {
//       const customerName  = String(row['customer_name']  || '').trim();
//       const productName   = String(row['product_name']   || '').trim();
//       const currencyCode  = String(row['currency_code']  || '').trim();

//       // Grouping priority:
//       // 1. invoice_number (INV-001, INV-002 etc.) — sabse sahi grouping
//       // 2. invoice_ref — manual grouping
//       // 3. customer_name — fallback (ek customer = ek invoice)
//       // 4. row index — last resort
//       const invoiceNumber = String(row['invoice_number'] || '').trim();
//       const invoiceRef    = String(row['invoice_ref']    || '').trim();
//       const ref           = invoiceNumber || invoiceRef || customerName || `row_${idx}`;

//       const customerId = String(row['customer_id'] || '').trim() || findCustomerId(customerName);
//       console.log("customerId", customerId)
//       const productId  = String(row['product_id']  || '').trim() || findProductId(productName);

//       // ── Create invoice entry on first encounter of this ref ──
//       if (!invoiceMap[ref]) {
//         // Discount — Wave InvoiceDiscountInput: amount, name, discountType, percentage
//         const discountAmount     = parseFloat(String(row['discount_amount']     || '')) || null;
//         const discountName       = String(row['discount_name']      || '').trim() || null;
//         const discountType       = String(row['discount_type']      || '').trim().toUpperCase() || null;
//         const discountPercentage = parseFloat(String(row['discount_percentage'] || '')) || null;

//         const discount =
//           discountType === 'FIXED' && discountAmount
//             ? { amount: discountAmount, name: discountName, discountType: 'FIXED' }
//           : discountType === 'PERCENTAGE' && discountPercentage
//             ? { percentage: discountPercentage, name: discountName, discountType: 'PERCENTAGE' }
//           : null;

//         // currency_code → Wave ka field naam 'currency' hai
//         const currency     = String(row['currency_code'] || row['currency'] || '').trim() || null;
//         const exchangeRate = parseFloat(String(row['exchange_rate'] || '')) || null;
//         const poNumber     = String(row['poNumber'] || row['po_number'] || '').trim() || null;

//         invoiceMap[ref] = {
//           _rowRef:       ref,
//           customerId,
//           customerName,
//           invoiceDate:   formatDate(row['invoice_date']),
//           dueDate:       formatDate(row['due_date']) || null,
//           memo:          String(row['memo'] || '').trim() || null,
//           currency,
//           exchangeRate,
//           poNumber,
//           invoiceNumber: String(row['invoice_number'] || '').trim() || null,
//           status:        String(row['status'] || '').trim().toUpperCase() || 'SAVED',
//           discount,
//           items:         [],
//           _errors:       [],
//           _warnings:     [],
//         };
//       } else {
//         // Same invoice_ref ki doosri row — missing fields update karo
//         if (!invoiceMap[ref].exchangeRate && exchangeRate) invoiceMap[ref].exchangeRate = exchangeRate;
//         if (!invoiceMap[ref].currency     && currency)     invoiceMap[ref].currency     = currency;
//         if (!invoiceMap[ref].poNumber     && poNumber)     invoiceMap[ref].poNumber     = poNumber;
//       }

//       const inv = invoiceMap[ref]; 

//       console.log("customerId", customerId)

//       // ── Validation ──
//       if (!customerName)   inv._errors.push('customer_name missing');
//       if (!productName)    inv._errors.push('product_name missing');
//       if (!inv.invoiceDate) inv._errors.push('invoice_date missing or invalid');
//       if (!customerId)     inv._warnings.push(`Customer "${customerName}" Wave mein nahi mila`);
//       if (!productId)      inv._warnings.push(`Product "${productName}" Wave mein nahi mila`);

//       // ── Item-level tax ──
//       const taxName   = String(row['item_tax_name']   || '').trim();
//       // const taxes = taxName && taxAmount ? [{ taxName, amount: taxAmount }] : [];

//       // ── Line item ──
//       inv.items.push({
//         productId,
//         productName,
//         description: String(row['item_description'] || row['description'] || '').trim(),
//         quantity:    parseFloat(String(row['quantity']))   || 1,
//         unitPrice:   parseFloat(String(row['unit_price'])) || 0,
//         // taxes,
//       });
//     });

//     // console.log("all items",items)

//     setParsedInvoices(Object.values(invoiceMap));
//   }, [findCustomerId, findProductId]);

//   // ─── File handling ────────────────────────────────────────────────
//   const handleFileProcess = (file) => {
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const wb = XLSX.read(evt.target?.result, { type: 'binary' });
//       // Prefer "Invoice Data" sheet, fallback to first sheet
//       const sheetName = wb.SheetNames.includes('Invoice Data') ? 'Invoice Data' : wb.SheetNames[0];
//       const ws = wb.Sheets[sheetName];

//       // Saari rows raw array mein lo (header: 1 = no header parsing)
//       const allRows = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 });

//       // Row 1 check — agar 'customer_name' jaisi value hai toh header row hai
//       // warna Row 1 section label hai aur Row 2 header hogi
//       const isHeaderRow = (row) =>
//         row.some((v) => String(v).toLowerCase().replace(/[\s*]/g, '').includes('customername'));

//       let headerRowIdx = 0;
//       if (!isHeaderRow(allRows[0] || [])) {
//         // Row 1 section label hai, Row 2 mein header dhundo
//         headerRowIdx = allRows.findIndex((r) => isHeaderRow(r));
//         if (headerRowIdx === -1) headerRowIdx = 0;
//       }

//       const headerRow = allRows[headerRowIdx];
//       // Clean headers — trim + remove trailing " *"
//       const cleanHeaders = headerRow.map((h) => String(h).trim().replace(/\s?\*$/, ''));

//       // Data rows = header ke baad ki saari rows
//       const rows = allRows.slice(headerRowIdx + 1)
//         .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
//         .map((r) =>
//           Object.fromEntries(cleanHeaders.map((h, i) => [h, r[i] ?? '']))
//         );

//       console.log('File processed — rows:', rows.length, 'customers at this point:', customers.length);
//       console.log('Sample row:', rows[0]);
//       setExcelData({ fileName: file.name, rows, sheetName });
//       // Agar customers/products already load hain toh seedha parse karo
//       // warna pendingRows mein rakho — useEffect unke load hone pe parse karega
//       if (customers.length > 0 || products.length > 0) {
//         parseInvoices(rows);
//       } else {
//         setPendingRows(rows);
//       }
//       setStep(3);
//       setToast({ message: `${file.name} uploaded successfully`, type: 'success' });
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileInput = (e) => {
//     const file = e.target.files?.[0];
//     if (file) handleFileProcess(file);
//     e.target.value = '';
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
//       handleFileProcess(file);
//     }
//   };

//   const validInvoices   = parsedInvoices.filter((i) => i._errors.length === 0);
//   const invalidInvoices = parsedInvoices.filter((i) => i._errors.length > 0);
//   const warnInvoices    = parsedInvoices.filter((i) => i._warnings.length > 0);

//   const filteredInvoices = parsedInvoices.filter((inv) => {
//     if (filterTab === 'ready')    return inv._errors.length === 0;
//     if (filterTab === 'errors')   return inv._errors.length > 0;
//     if (filterTab === 'warnings') return inv._warnings.length > 0;
//     return true;
//   });

//   const getInvoiceTotal = (inv) =>
//     inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

//   // ─── Import ───────────────────────────────────────────────────────
//   const handleImport = async () => {
//     if (!validInvoices.length) return;
//     setImporting(true);
//     try {
//       const res = await fetch(`${API_URL}/api/invoices/bulk`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ businessId: selectedBusiness?.id, invoices: validInvoices }),
//       });
//       const data = await res.json();
//       setResults(data.results);
//       setStep(4);
//     } catch (err) {
//       setToast({ message: `Import failed: ${err.message}`, type: 'error' });
//     } finally {
//       setImporting(false);
//     }
//   };

//   const handleLogout = async () => {
//     await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
//     window.location.href = '/';
//   };

//   const reset = () => {
//     setStep(1);
//     setSelectedBusiness(null);
//     setExcelData(null);
//     setParsedInvoices([]);
//     setResults(null);
//     setFilterTab('all');
//   };

//   // ─── Loading skeleton ─────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="flex flex-col items-center gap-6">
//           <div className="w-14 h-14 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
//             <FileSpreadsheet className="w-7 h-7 text-white" />
//           </div>
//           <div className="space-y-3 w-64">
//             <div className="h-4 rounded-full bg-slate-100 animate-pulse w-full" />
//             <div className="h-4 rounded-full bg-slate-100 animate-pulse w-3/4 mx-auto" />
//             <div className="h-4 rounded-full bg-slate-100 animate-pulse w-1/2 mx-auto" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 font-body">
//       <Navbar selectedBusiness={selectedBusiness} onLogout={handleLogout} />

//       {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

//       <main className="max-w-5xl mx-auto px-6 pt-10 pb-24">
//         <StepIndicator current={step} />

//         <AnimatePresence mode="wait">

//           {/* ── STEP 1: Select Business ── */}
//           {step === 1 && (
//             <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
//               <div className="mb-8">
//                 <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Select your business</h1>
//                 <p className="text-slate-500 text-sm">Choose the company you want to import invoices for.</p>
//               </div>
//               {businesses.length === 0 ? (
//                 <div className="flex flex-col items-center py-20 text-center">
//                   <p className="text-slate-500 font-medium">No businesses found</p>
//                   <p className="text-slate-400 text-sm mt-1">Make sure your Wave account has at least one business.</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {businesses.map((biz, i) => (
//                     <motion.button
//                       key={biz.id}
//                       initial={{ opacity: 0, y: 16 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: i * 0.07, duration: 0.35 }}
//                       onClick={() => { setSelectedBusiness(biz); onBusinessSelect?.(biz); setStep(2); }}
//                       className="group text-left bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100 hover:border-indigo-300 transition-all duration-200 relative overflow-hidden"
//                     >
//                       <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
//                       <div className="flex items-start justify-between mb-4">
//                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-heading ${getInitialColor(biz.name)}`}>
//                           {biz.name[0].toUpperCase()}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {biz.currency?.code && (
//                             <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
//                               {biz.currency.code}
//                             </span>
//                           )}
//                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
//                         </div>
//                       </div>
//                       <p className="font-heading font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">{biz.name}</p>
//                       <p className="text-xs text-slate-400">{biz.organizationalType || 'Business'}</p>
//                     </motion.button>
//                   ))}
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ── STEP 2: Upload Excel ── */}
//           {step === 2 && (
//             <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
//               <div className="mb-8">
//                 <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Upload your Excel file</h1>
//                 <p className="text-slate-500 text-sm">Make sure your file matches the column format below.</p>
//               </div>

//               {/* Column guide */}
//               <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
//                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-heading">Column Format Guide</p>
//                 <div className="flex flex-wrap gap-2">
//                   {REQUIRED_COLS.map((col) => (
//                     <span key={col} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-medium">
//                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
//                       {col}
//                     </span>
//                   ))}
//                   {OPTIONAL_COLS.map((col) => (
//                     <span key={col} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 font-mono">
//                       {col}
//                       <span className="text-slate-400 text-[10px]">opt</span>
//                     </span>
//                   ))}
//                 </div>
//                 <p className="text-xs text-slate-400 mt-3">
//                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1" />
//                   Blue = Required · No indicator = Optional
//                 </p>
//               </div>

//               {/* Drop zone */}
//               <div
//                 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={handleDrop}
//                 onClick={() => fileRef.current?.click()}
//                 className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
//                   dragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'bg-white hover:bg-slate-50 hover:border-indigo-400 border-slate-200'
//                 }`}
//               >
//                 <div className="flex flex-col items-center gap-4">
//                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-indigo-500 shadow-xl shadow-indigo-200' : 'bg-indigo-50'}`}>
//                     <UploadCloud className={`w-8 h-8 transition-colors ${dragOver ? 'text-white' : 'text-indigo-500'}`} />
//                   </div>
//                   <div>
//                     <p className="text-slate-900 font-heading font-semibold text-lg mb-1">
//                       {dragOver ? 'Release to upload' : 'Drop your Excel file here'}
//                     </p>
//                     <p className="text-slate-500 text-sm">Supports .xlsx and .xls · "Invoice Data" sheet will be read</p>
//                   </div>
//                   <span className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors min-h-[44px] flex items-center gap-2 shadow-md shadow-indigo-200">
//                     <Upload className="w-4 h-4" /> Choose File
//                   </span>
//                 </div>
//                 <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} />
//               </div>

//               <button onClick={() => setStep(1)} className="mt-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
//                 <ArrowLeft className="w-4 h-4" /> Back to business selection
//               </button>
//             </motion.div>
//           )}

//           {/* ── STEP 3: Preview ── */}
//           {step === 3 && (
//             <motion.div key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//                 <div>
//                   <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Preview & Confirm</h1>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <span className="text-slate-500 text-sm">{excelData?.fileName}</span>
//                     <span className="w-1 h-1 rounded-full bg-slate-300" />
//                     <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{validInvoices.length} ready</span>
//                     {invalidInvoices.length > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{invalidInvoices.length} errors</span>}
//                     {warnInvoices.length > 0 && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">{warnInvoices.length} warnings</span>}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl transition-all hover:bg-slate-50 min-h-[44px] font-medium">
//                     <ArrowLeft className="w-4 h-4" /> Back
//                   </button>
//                   <button onClick={handleImport} disabled={importing || validInvoices.length === 0}
//                     className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl min-h-[44px] hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
//                     {importing
//                       ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Importing...</>
//                       : <><Zap className="w-4 h-4" /> Import {validInvoices.length} Invoices</>}
//                   </button>
//                 </div>
//               </div>

//               {/* Error banner */}
//               {invalidInvoices.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
//                   <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-red-700 font-semibold text-sm mb-1">{invalidInvoices.length} invoice(s) have errors and will be skipped</p>
//                     {invalidInvoices.slice(0, 3).map((inv) => (
//                       <p key={inv._rowRef} className="text-red-500 text-xs">· {inv.customerName}: {inv._errors.join(', ')}</p>
//                     ))}
//                     {invalidInvoices.length > 3 && <p className="text-red-400 text-xs mt-0.5">and {invalidInvoices.length - 3} more...</p>}
//                   </div>
//                 </div>
//               )}

//               {/* Warning banner */}
//               {warnInvoices.length > 0 && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
//                   <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-amber-700 font-semibold text-sm mb-1">{warnInvoices.length} invoice(s) have warnings</p>
//                     {warnInvoices.slice(0, 3).map((inv) => (
//                       <p key={inv._rowRef} className="text-amber-600 text-xs">· {inv.customerName}: {inv._warnings.join(', ')}</p>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Filter tabs */}
//               <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 w-fit">
//                 {[
//                   { key: 'all',      label: `All (${parsedInvoices.length})` },
//                   { key: 'ready',    label: `Ready (${validInvoices.length})` },
//                   { key: 'errors',   label: `Errors (${invalidInvoices.length})` },
//                   { key: 'warnings', label: `Warnings (${warnInvoices.length})` },
//                 ].map(({ key, label }) => (
//                   <button key={key} onClick={() => setFilterTab(key)}
//                     className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
//                       filterTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
//                     }`}>
//                     {label}
//                   </button>
//                 ))}
//               </div>

//               {/* Invoice list */}
//               <div className="space-y-3 pb-24">
//                 {filteredInvoices.map((inv, i) => {
//                   const total    = getInvoiceTotal(inv);
//                   const hasError = inv._errors.length > 0;
//                   const hasWarn  = inv._warnings.length > 0;
//                   return (
//                     <motion.div key={inv._rowRef}
//                       initial={{ opacity: 0, x: -16 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: i * 0.04, duration: 0.3 }}
//                       className={`bg-white rounded-2xl border p-4 relative overflow-hidden transition-all ${
//                         hasError ? 'border-red-200 opacity-75' : hasWarn ? 'border-amber-200' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
//                       }`}
//                     >
//                       <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${hasError ? 'bg-red-400' : hasWarn ? 'bg-amber-400' : 'bg-emerald-400'}`} />
//                       <div className="pl-3 flex items-start justify-between gap-3">
//                         <div className="flex items-start gap-3 flex-1 min-w-0">
//                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-heading flex-shrink-0 ${getInitialColor(inv.customerName || 'U')}`}>
//                             {(inv.customerName || 'U')[0].toUpperCase()}
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <div className="flex flex-wrap items-center gap-2 mb-1">
//                               <span className="font-semibold text-slate-900 font-heading text-sm">{inv.customerName || 'Unknown'}</span>
//                               {inv.invoiceDate && <span className="text-xs text-slate-400">{inv.invoiceDate}</span>}
//                               {inv.currency && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{inv.currency}</span>}
//                               {inv._rowRef && <span className="text-xs text-slate-400">#{inv._rowRef}</span>}
//                             </div>
//                             {/* Product tags */}
//                             <div className="flex flex-wrap gap-1.5 mb-1">
//                               {inv.items.slice(0, 3).map((item, j) => (
//                                 <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
//                                   {item.productName} ×{item.quantity}
//                                   {/* {item.taxes?.length > 0 && <span className="text-amber-500 ml-1">+tax</span>} */}
//                                 </span>
//                               ))}
//                               {inv.items.length > 3 && (
//                                 <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{inv.items.length - 3} more</span>
//                               )}
//                             </div>
//                             {/* Discount badge */}
//                             {inv.discount && (
//                               <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">
//                                 {inv.discount.name ? `${inv.discount.name} · ` : ''}
//                                 {inv.discount.discountType === 'FIXED'
//                                   ? `${inv.currency || ''} ${inv.discount.amount} off`
//                                   : `${inv.discount.percentage}% off`}
//                               </span>
//                             )}
//                             {/* Errors */}
//                             {hasError && (
//                               <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
//                                 <AlertTriangle className="w-3 h-3" />{inv._errors.join(' · ')}
//                               </p>
//                             )}
//                             {/* Warnings */}
//                             {hasWarn && !hasError && (
//                               <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
//                                 <AlertTriangle className="w-3 h-3" />{inv._warnings.join(' · ')}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex flex-col items-end gap-2 flex-shrink-0">
//                           <span className="font-heading font-bold text-slate-900 text-base">${total.toFixed(2)}</span>
//                           <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
//                             hasError ? 'bg-red-100 text-red-600' : hasWarn ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-700'
//                           }`}>
//                             {hasError ? 'Error' : hasWarn ? 'Warning' : 'Ready'}
//                           </span>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>

//               {/* Sticky bottom bar */}
//               {validInvoices.length > 0 && (
//                 <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-6 py-4">
//                   <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
//                     <p className="text-sm text-slate-600">
//                       <span className="font-semibold text-slate-900">{validInvoices.length} invoices</span> ready to import
//                       {invalidInvoices.length > 0 && <span className="text-slate-400"> · {invalidInvoices.length} will be skipped</span>}
//                     </p>
//                     <button onClick={handleImport} disabled={importing}
//                       className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white text-sm font-semibold px-8 py-3 rounded-xl min-h-[44px] hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-50 active:scale-95">
//                       {importing
//                         ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Importing...</>
//                         : <><Zap className="w-4 h-4" /> Import {validInvoices.length} Invoices →</>}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ── STEP 4: Results ── */}
//           {step === 4 && results && (
//             <motion.div key="step4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
//               <ImportResults results={results} onReset={reset} />
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }





import { API_URL } from '../config';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, UploadCloud, ChevronRight, AlertTriangle,
  FileSpreadsheet, ArrowLeft, Zap,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StepIndicator from '../components/StepIndicator';
import ImportResults from '../components/ImportResults';
import Toast from '../components/Toast';

const PASTEL_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-violet-100 text-violet-700',
];

function getInitialColor(name) {
  const idx = name.charCodeAt(0) % PASTEL_COLORS.length;
  return PASTEL_COLORS[idx];
}

const REQUIRED_COLS = ['customer_name *', 'invoice_date *', 'product_name *', 'quantity *', 'unit_price *'];
const OPTIONAL_COLS = ['invoice_ref', 'invoice_number', 'status', 'currency_code', 'exchange_rate', 'due_date', 'memo', 'poNumber', 'item_description', 'item_tax_name', 'item_tax_amount', 'discount_amount', 'discount_name', 'discount_type', 'discount_percentage'];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Dashboard({ onBusinessSelect } = {}) {
  const [businesses, setBusinesses]     = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [customers, setCustomers]       = useState([]);
  const [products, setProducts]         = useState([]);
  const [salesTaxes, setSalesTaxes]     = useState([]);
  const [excelData, setExcelData]       = useState(null);
  const [parsedInvoices, setParsedInvoices] = useState([]);
  const [importing, setImporting]       = useState(false);
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [step, setStep]                 = useState(1);
  const [dragOver, setDragOver]         = useState(false);
  const [filterTab, setFilterTab]       = useState('all');
  const [toast, setToast]               = useState(null);
  const [pendingRows, setPendingRows]   = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/businesses`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { window.location.href = '/'; return; }
        setBusinesses(data);
        setLoading(false);
      })
      .catch(() => { window.location.href = '/'; });
  }, []);

  useEffect(() => {
    if (!selectedBusiness) return;
    Promise.all([
      fetch(`${API_URL}/api/businesses/${selectedBusiness.id}/customers`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/api/businesses/${selectedBusiness.id}/products`,  { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/api/businesses/${selectedBusiness.id}/taxes`,     { credentials: 'include' }).then((r) => r.json()),
    ]).then(([c, p, t]) => {
      setCustomers(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);
      setSalesTaxes(Array.isArray(t) ? t : []);
    });
  }, [selectedBusiness]);

  // Jab customers/products load ho jaayein aur pending rows hon toh parse karo
  useEffect(() => {
    if (pendingRows && customers.length >= 0 && products.length >= 0) {
      parseInvoices(pendingRows);
      setPendingRows(null);
    }
  }, [customers, products, pendingRows]);

  const findCustomerId = useCallback((name) => {
    if (!name) return null;
    console.log(customers)
    return customers.find((c) => c.name?.toLowerCase().trim() === name?.toLowerCase().trim())?.id || null;
  }, [customers]);

  const findProductId = useCallback((name) => {
    if (!name) return null;
    return products.find((p) => p.name?.toLowerCase().trim() === name?.toLowerCase().trim())?.id || null;
  }, [products]);

  const findSalesTaxId = useCallback((name) => {
    if (!name) return null;
    return salesTaxes.find(
      (t) => t.name?.toLowerCase().trim() === name?.toLowerCase().trim() ||
             t.abbreviation?.toLowerCase().trim() === name?.toLowerCase().trim()
    )?.id || null;
  }, [salesTaxes]);

  const formatDate = (val) => {
    if (!val) return null;
    if (typeof val === 'number') {
      const date = XLSX.SSF.parse_date_code(val);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    const s = String(val).trim();
    return s || null;
  };

  // ─── Parse Excel rows → Wave invoice format ──────────────────────
  const parseInvoices = useCallback((rows) => {
    console.log('parseInvoices called — rows:', rows.length, 'customers:', customers.length, 'products:', products.length);
    console.log('First row sample:', rows[0]);
    const invoiceMap = {};

    rows.forEach((row, idx) => {
      const customerName  = String(row['customer_name']  || '').trim();
      const productName   = String(row['product_name']   || '').trim();
      const currencyCode  = String(row['currency_code']  || '').trim();

      // Grouping priority:
      // 1. invoice_number (INV-001, INV-002 etc.) — sabse sahi grouping
      // 2. invoice_ref — manual grouping
      // 3. customer_name — fallback (ek customer = ek invoice)
      // 4. row index — last resort
      const invoiceNumber = String(row['invoice_number'] || '').trim();
      const invoiceRef    = String(row['invoice_ref']    || '').trim();
      const ref           = invoiceNumber || invoiceRef || customerName || `row_${idx}`;

      const customerId = String(row['customer_id'] || '').trim() || findCustomerId(customerName);
      console.log("customerId", customerId)
      const productId  = String(row['product_id']  || '').trim() || findProductId(productName);

      // ── Create invoice entry on first encounter of this ref ──
      if (!invoiceMap[ref]) {
        // Discount — Wave InvoiceDiscountInput: amount, name, discountType, percentage
        const discountAmount     = parseFloat(String(row['discount_amount']     || '')) || null;
        const discountName       = String(row['discount_name']      || '').trim() || null;
        const discountType       = String(row['discount_type']      || '').trim().toUpperCase() || null;
        const discountPercentage = parseFloat(String(row['discount_percentage'] || '')) || null;

        const discount =
          discountType === 'FIXED' && discountAmount
            ? { amount: discountAmount, name: discountName, discountType: 'FIXED' }
          : discountType === 'PERCENTAGE' && discountPercentage
            ? { percentage: discountPercentage, name: discountName, discountType: 'PERCENTAGE' }
          : null;

        // currency_code → Wave ka field naam 'currency' hai
        const currency     = String(row['currency_code'] || row['currency'] || '').trim() || null;
        const exchangeRate = parseFloat(String(row['exchange_rate'] || '')) || null;
        const poNumber     = String(row['poNumber'] || row['po_number'] || '').trim() || null;

        invoiceMap[ref] = {
          _rowRef:       ref,
          customerId,
          customerName,
          invoiceDate:   formatDate(row['invoice_date']),
          dueDate:       formatDate(row['due_date']) || null,
          memo:          String(row['memo'] || '').trim() || null,
          currency,
          exchangeRate,
          poNumber,
          invoiceNumber: String(row['invoice_number'] || '').trim() || null,
          status:        String(row['status'] || '').trim().toUpperCase() || 'SAVED',
          discount,
          items:         [],
          _errors:       [],
          _warnings:     [],
        };
      } else {
        // Same invoice_ref ki doosri row — missing fields update karo
        // if (!invoiceMap[ref].exchangeRate && exchangeRate) invoiceMap[ref].exchangeRate = exchangeRate;
        // if (!invoiceMap[ref].currency     && currency)     invoiceMap[ref].currency     = currency;
        // if (!invoiceMap[ref].poNumber     && poNumber)     invoiceMap[ref].poNumber     = poNumber;
      }

      const inv = invoiceMap[ref]; 

      console.log("customerId", customerId)

      // ── Validation ──
      if (!customerName)   inv._errors.push('customer_name missing');
      if (!productName)    inv._errors.push('product_name missing');
      if (!inv.invoiceDate) inv._errors.push('invoice_date missing or invalid');
      if (!customerId)     inv._warnings.push(`Customer "${customerName}" Wave mein nahi mila`);
      if (!productId)      inv._warnings.push(`Product "${productName}" Wave mein nahi mila`);

      // ── Item-level tax ──
      const taxName   = String(row['item_tax_name']   || '').trim();
      const salesTaxId = taxName ? findSalesTaxId(taxName) : null;
      const taxes = salesTaxId ? [{ salesTaxId }] : undefined;

      if (taxName && !salesTaxId) {
        // Tax name diya tha lekin Wave mein nahi mila — warning
        invoiceMap[ref]._warnings.push(`Tax "${taxName}" Wave mein nahi mila`);
      }

      // ── Line item ──
      inv.items.push({
        productId,
        productName,
        description: String(row['item_description'] || row['description'] || '').trim(),
        quantity:    parseFloat(String(row['quantity']))   || 1,
        unitPrice:   parseFloat(String(row['unit_price'])) || 0,
        taxes,
      });
    });

    // console.log("all items",items)

    setParsedInvoices(Object.values(invoiceMap));
  }, [findCustomerId, findProductId, findSalesTaxId]);

  // ─── File handling ────────────────────────────────────────────────
  const handleFileProcess = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      // Prefer "Invoice Data" sheet, fallback to first sheet
      const sheetName = wb.SheetNames.includes('Invoice Data') ? 'Invoice Data' : wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];

      // Saari rows raw array mein lo (header: 1 = no header parsing)
      const allRows = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 });

      // Row 1 check — agar 'customer_name' jaisi value hai toh header row hai
      // warna Row 1 section label hai aur Row 2 header hogi
      const isHeaderRow = (row) =>
        row.some((v) => String(v).toLowerCase().replace(/[\s*]/g, '').includes('customername'));

      let headerRowIdx = 0;
      if (!isHeaderRow(allRows[0] || [])) {
        // Row 1 section label hai, Row 2 mein header dhundo
        headerRowIdx = allRows.findIndex((r) => isHeaderRow(r));
        if (headerRowIdx === -1) headerRowIdx = 0;
      }

      const headerRow = allRows[headerRowIdx];
      // Clean headers — trim + remove trailing " *"
      const cleanHeaders = headerRow.map((h) => String(h).trim().replace(/\s?\*$/, ''));

      // Data rows = header ke baad ki saari rows
      const rows = allRows.slice(headerRowIdx + 1)
        .filter((r) => r.some((v) => v !== '' && v !== null && v !== undefined))
        .map((r) =>
          Object.fromEntries(cleanHeaders.map((h, i) => [h, r[i] ?? '']))
        );

      console.log('File processed — rows:', rows.length, 'customers at this point:', customers.length);
      console.log('Sample row:', rows[0]);
      setExcelData({ fileName: file.name, rows, sheetName });
      // Agar customers/products already load hain toh seedha parse karo
      // warna pendingRows mein rakho — useEffect unke load hone pe parse karega
      if (customers.length > 0 || products.length > 0) {
        parseInvoices(rows);
      } else {
        setPendingRows(rows);
      }
      setStep(3);
      setToast({ message: `${file.name} uploaded successfully`, type: 'success' });
    };
    reader.readAsBinaryString(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileProcess(file);
    }
  };

  const validInvoices   = parsedInvoices.filter((i) => i._errors.length === 0);
  const invalidInvoices = parsedInvoices.filter((i) => i._errors.length > 0);
  const warnInvoices    = parsedInvoices.filter((i) => i._warnings.length > 0);

  const filteredInvoices = parsedInvoices.filter((inv) => {
    if (filterTab === 'ready')    return inv._errors.length === 0;
    if (filterTab === 'errors')   return inv._errors.length > 0;
    if (filterTab === 'warnings') return inv._warnings.length > 0;
    return true;
  });

  const getInvoiceTotal = (inv) =>
    inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // ─── Import ───────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!validInvoices.length) return;
    setImporting(true);
    try {
      const res = await fetch(`${API_URL}/api/invoices/bulk`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBusiness?.id, invoices: validInvoices }),
      });
      const data = await res.json();
      setResults(data.results);
      setStep(4);
    } catch (err) {
      setToast({ message: `Import failed: ${err.message}`, type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  };

  const reset = () => {
    setStep(1);
    setSelectedBusiness(null);
    setExcelData(null);
    setParsedInvoices([]);
    setResults(null);
    setFilterTab('all');
  };

  // ─── Loading skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-3 w-64">
            <div className="h-4 rounded-full bg-slate-100 animate-pulse w-full" />
            <div className="h-4 rounded-full bg-slate-100 animate-pulse w-3/4 mx-auto" />
            <div className="h-4 rounded-full bg-slate-100 animate-pulse w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body flex">
      <Sidebar selectedBusiness={selectedBusiness} onLogout={handleLogout} />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-10 pb-24">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Select Business ── */}
          {step === 1 && (
            <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="mb-8">
                <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Select your business</h1>
                <p className="text-slate-500 text-sm">Choose the company you want to import invoices for.</p>
              </div>
              {businesses.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <p className="text-slate-500 font-medium">No businesses found</p>
                  <p className="text-slate-400 text-sm mt-1">Make sure your Wave account has at least one business.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {businesses.map((biz, i) => (
                    <motion.button
                      key={biz.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      onClick={() => { setSelectedBusiness(biz); onBusinessSelect?.(biz); setStep(2); }}
                      className="group text-left bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100 hover:border-indigo-300 transition-all duration-200 relative overflow-hidden"
                    >
                      <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-heading ${getInitialColor(biz.name)}`}>
                          {biz.name[0].toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          {biz.currency?.code && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {biz.currency.code}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                      <p className="font-heading font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">{biz.name}</p>
                      <p className="text-xs text-slate-400">{biz.organizationalType || 'Business'}</p>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Upload Excel ── */}
          {step === 2 && (
            <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="mb-8">
                <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Upload your Excel file</h1>
                <p className="text-slate-500 text-sm">Make sure your file matches the column format below.</p>
              </div>

              {/* Column guide */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-heading">Column Format Guide</p>
                <div className="flex flex-wrap gap-2">
                  {REQUIRED_COLS.map((col) => (
                    <span key={col} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                      {col}
                    </span>
                  ))}
                  {OPTIONAL_COLS.map((col) => (
                    <span key={col} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 font-mono">
                      {col}
                      <span className="text-slate-400 text-[10px]">opt</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1" />
                  Blue = Required · No indicator = Optional
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
                  dragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'bg-white hover:bg-slate-50 hover:border-indigo-400 border-slate-200'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-indigo-500 shadow-xl shadow-indigo-200' : 'bg-indigo-50'}`}>
                    <UploadCloud className={`w-8 h-8 transition-colors ${dragOver ? 'text-white' : 'text-indigo-500'}`} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-heading font-semibold text-lg mb-1">
                      {dragOver ? 'Release to upload' : 'Drop your Excel file here'}
                    </p>
                    <p className="text-slate-500 text-sm">Supports .xlsx and .xls · "Invoice Data" sheet will be read</p>
                  </div>
                  <span className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors min-h-[44px] flex items-center gap-2 shadow-md shadow-indigo-200">
                    <Upload className="w-4 h-4" /> Choose File
                  </span>
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} />
              </div>

              <button onClick={() => setStep(1)} className="mt-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to business selection
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === 3 && (
            <motion.div key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-slate-900 mb-1">Preview & Confirm</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-sm">{excelData?.fileName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{validInvoices.length} ready</span>
                    {invalidInvoices.length > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{invalidInvoices.length} errors</span>}
                    {warnInvoices.length > 0 && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">{warnInvoices.length} warnings</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl transition-all hover:bg-slate-50 min-h-[44px] font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleImport} disabled={importing || validInvoices.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl min-h-[44px] hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                    {importing
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Importing...</>
                      : <><Zap className="w-4 h-4" /> Import {validInvoices.length} Invoices</>}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {invalidInvoices.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold text-sm mb-1">{invalidInvoices.length} invoice(s) have errors and will be skipped</p>
                    {invalidInvoices.slice(0, 3).map((inv) => (
                      <p key={inv._rowRef} className="text-red-500 text-xs">· {inv.customerName}: {inv._errors.join(', ')}</p>
                    ))}
                    {invalidInvoices.length > 3 && <p className="text-red-400 text-xs mt-0.5">and {invalidInvoices.length - 3} more...</p>}
                  </div>
                </div>
              )}

              {/* Warning banner */}
              {warnInvoices.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-700 font-semibold text-sm mb-1">{warnInvoices.length} invoice(s) have warnings</p>
                    {warnInvoices.slice(0, 3).map((inv) => (
                      <p key={inv._rowRef} className="text-amber-600 text-xs">· {inv.customerName}: {inv._warnings.join(', ')}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 w-fit">
                {[
                  { key: 'all',      label: `All (${parsedInvoices.length})` },
                  { key: 'ready',    label: `Ready (${validInvoices.length})` },
                  { key: 'errors',   label: `Errors (${invalidInvoices.length})` },
                  { key: 'warnings', label: `Warnings (${warnInvoices.length})` },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setFilterTab(key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                      filterTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Invoice list */}
              <div className="space-y-3 pb-24">
                {filteredInvoices.map((inv, i) => {
                  const total    = getInvoiceTotal(inv);
                  const hasError = inv._errors.length > 0;
                  const hasWarn  = inv._warnings.length > 0;
                  return (
                    <motion.div key={inv._rowRef}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className={`bg-white rounded-2xl border p-4 relative overflow-hidden transition-all ${
                        hasError ? 'border-red-200 opacity-75' : hasWarn ? 'border-amber-200' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${hasError ? 'bg-red-400' : hasWarn ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <div className="pl-3 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-heading flex-shrink-0 ${getInitialColor(inv.customerName || 'U')}`}>
                            {(inv.customerName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 font-heading text-sm">{inv.customerName || 'Unknown'}</span>
                              {inv.invoiceDate && <span className="text-xs text-slate-400">{inv.invoiceDate}</span>}
                              {inv.currency && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{inv.currency}</span>}
                              {inv._rowRef && <span className="text-xs text-slate-400">#{inv._rowRef}</span>}
                            </div>
                            {/* Product tags */}
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              {inv.items.slice(0, 3).map((item, j) => (
                                <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  {item.productName} ×{item.quantity}
                                  {/* {item.taxes?.length > 0 && <span className="text-amber-500 ml-1">+tax</span>} */}
                                </span>
                              ))}
                              {inv.items.length > 3 && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{inv.items.length - 3} more</span>
                              )}
                            </div>
                            {/* Discount badge */}
                            {inv.discount && (
                              <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">
                                {inv.discount.name ? `${inv.discount.name} · ` : ''}
                                {inv.discount.discountType === 'FIXED'
                                  ? `${inv.currency || ''} ${inv.discount.amount} off`
                                  : `${inv.discount.percentage}% off`}
                              </span>
                            )}
                            {/* Errors */}
                            {hasError && (
                              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />{inv._errors.join(' · ')}
                              </p>
                            )}
                            {/* Warnings */}
                            {hasWarn && !hasError && (
                              <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />{inv._warnings.join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="font-heading font-bold text-slate-900 text-base">${total.toFixed(2)}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            hasError ? 'bg-red-100 text-red-600' : hasWarn ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {hasError ? 'Error' : hasWarn ? 'Warning' : 'Ready'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sticky bottom bar */}
              {validInvoices.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-6 py-4">
                  <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{validInvoices.length} invoices</span> ready to import
                      {invalidInvoices.length > 0 && <span className="text-slate-400"> · {invalidInvoices.length} will be skipped</span>}
                    </p>
                    <button onClick={handleImport} disabled={importing}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white text-sm font-semibold px-8 py-3 rounded-xl min-h-[44px] hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-50 active:scale-95">
                      {importing
                        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Importing...</>
                        : <><Zap className="w-4 h-4" /> Import {validInvoices.length} Invoices →</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Results ── */}
          {step === 4 && results && (
            <motion.div key="step4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ImportResults results={results} onReset={reset} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}






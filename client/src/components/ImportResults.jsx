// export default function ImportResults({ results, onReset }) {
//   const success = results.filter((r) => r.success);
//   const failed = results.filter((r) => !r.success);

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-1">Import Complete!</h2>
//       <p className="text-slate-400 text-sm mb-6">Results dekho neeche</p>

//       {/* Summary */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
//           <p className="text-3xl font-bold text-white">{results.length}</p>
//           <p className="text-slate-400 text-xs mt-1">Total</p>
//         </div>
//         <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4 text-center">
//           <p className="text-3xl font-bold text-green-400">{success.length}</p>
//           <p className="text-slate-400 text-xs mt-1">Successful</p>
//         </div>
//         <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-center">
//           <p className="text-3xl font-bold text-red-400">{failed.length}</p>
//           <p className="text-slate-400 text-xs mt-1">Failed</p>
//         </div>
//       </div>

//       {/* Success list */}
//       {success.length > 0 && (
//         <div className="mb-4">
//           <p className="text-sm font-semibold text-green-400 mb-2">✅ Successfully Created</p>
//           <div className="space-y-2">
//             {success.map((r, i) => (
//               <div key={i} className="bg-slate-900 border border-green-500/20 rounded-xl p-3 flex items-center justify-between">
//                 <div>
//                   <span className="text-white text-sm font-medium">{r.invoice?.customer?.name}</span>
//                   <span className="text-slate-500 text-xs ml-2">#{r.invoice?.invoiceNumber}</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-green-400 text-sm font-medium">
//                     {r.invoice?.total?.currency?.symbol}{r.invoice?.total?.value}
//                   </span>
//                   {r.invoice?.viewUrl && (
//                     <a href={r.invoice.viewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">
//                       View →
//                     </a>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Failed list */}
//       {failed.length > 0 && (
//         <div className="mb-6">
//           <p className="text-sm font-semibold text-red-400 mb-2">❌ Failed</p>
//           <div className="space-y-2">
//             {failed.map((r, i) => (
//               <div key={i} className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
//                 <p className="text-slate-300 text-sm">{r.rowRef}</p>
//                 {r.errors?.map((e, j) => (
//                   <p key={j} className="text-red-400 text-xs mt-1">• {e.message}</p>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <button
//         onClick={onReset}
//         className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors"
//       >
//         Naya Import Karo
//       </button>
//     </div>
//   );
// }




import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ExternalLink, RefreshCcw, ArrowUpRight } from 'lucide-react';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 40;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setCount(Math.round((target / steps) * current));
      if (current >= steps) { setCount(target); clearInterval(timer); }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({
  label,
  value,
  variant,
  delay,
}) {
  const count = useCountUp(value, 1000);
  const styles = {
    neutral: 'bg-white border-slate-200 text-slate-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    danger: 'bg-red-50 border-red-200 text-red-600',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border p-6 text-center ${styles[variant]}`}
    >
      <p className={`text-4xl font-heading font-extrabold mb-1 ${styles[variant].split(' ')[2]}`}>{count}</p>
      <p className="text-sm font-medium text-slate-500 font-body">{label}</p>
    </motion.div>
  );
}

export default function ImportResults({ results, onReset }) {
  const success = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return (
    <div>
      {/* Success Icon */}
      <div className="flex flex-col items-center mb-10 pt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="success-burst w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 shadow-xl shadow-emerald-100"
        >
          <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
            <circle cx="30" cy="30" r="28" stroke="#10b981" strokeWidth="3" />
            <path
              d="M18 30 L26 38 L42 22"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw"
            />
          </svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-heading font-bold text-slate-900 mb-1"
        >
          Import Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-sm font-body"
        >
          Your invoices have been imported to Wave.
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total" value={results.length} variant="neutral" delay={0.2} />
        <StatCard label="Successful" value={success.length} variant="success" delay={0.3} />
        <StatCard label="Failed" value={failed.length} variant="danger" delay={0.4} />
      </div>

      {/* Success list */}
      {success.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700 font-heading">Successfully Created ({success.length})</p>
          </div>
          <div className="space-y-2">
            {success.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                className="bg-white border border-emerald-100 rounded-xl p-4 flex items-center justify-between relative overflow-hidden"
              >
                <div className="absolute left-0 inset-y-0 w-1 bg-emerald-400 rounded-l-xl" />
                <div className="pl-3">
                  <span className="font-semibold text-slate-900 font-heading text-sm">
                    {r.invoice?.customer?.name}
                  </span>
                  {r.invoice?.invoiceNumber && (
                    <span className="text-slate-400 text-xs ml-2">#{r.invoice.invoiceNumber}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {r.invoice?.total && (
                    <span className="font-heading font-bold text-emerald-600 text-sm">
                      {r.invoice.total.currency?.symbol}{r.invoice.total.value}
                    </span>
                  )}
                  {r.invoice?.viewUrl && (
                    <a
                      href={r.invoice.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      View in Wave <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Failed list */}
      {failed.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-600 font-heading">Failed ({failed.length})</p>
          </div>
          <div className="space-y-2">
            {failed.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.04 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 relative overflow-hidden"
              >
                <div className="absolute left-0 inset-y-0 w-1 bg-red-400 rounded-l-xl" />
                <div className="pl-3">
                  <p className="text-slate-700 font-medium text-sm font-heading">{r.rowRef || 'Unknown'}</p>
                  {r.errors?.map((e, j) => (
                    <p key={j} className="text-red-500 text-xs mt-0.5">· {e.message}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-all min-h-[44px] font-heading"
        >
          <RefreshCcw className="w-4 h-4" />
          Import Another File
        </button>
        {success.length > 0 && success[0].invoice?.viewUrl && (
          <a
            href={success[0].invoice.viewUrl.replace(/\/\d+$/, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-300 transition-all min-h-[44px] font-heading"
          >
            View all in Wave <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </motion.div>
    </div>
  );
}
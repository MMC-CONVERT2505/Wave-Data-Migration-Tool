// export default function Login() {
//   const handleLogin = () => {
//     window.location.href = `${API_URL}/auth/wave`;
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
//       {/* Background grid */}
//       <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
//       {/* Glow orb */}
//       <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

//       <div className="relative z-10 w-full max-w-md mx-4">
//         {/* Card */}
//         <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-10 shadow-2xl">
          
//           {/* Logo area */}
//           <div className="flex items-center justify-center mb-8">
//             <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
//               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//           </div>

//           <h1 className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
//             Wave Invoice Importer
//           </h1>
//           <p className="text-slate-400 text-sm text-center mb-8">
//             Excel se Wave me invoices import karo ek click mein
//           </p>

//           {/* Features */}
//           <div className="space-y-3 mb-8">
//             {[
//               { icon: "📊", text: "Excel file upload karo" },
//               { icon: "🏢", text: "Company select karo" },
//               { icon: "⚡", text: "Bulk invoices create karo" },
//             ].map((f) => (
//               <div key={f.text} className="flex items-center gap-3 text-sm text-slate-300">
//                 <span className="text-lg">{f.icon}</span>
//                 <span>{f.text}</span>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={handleLogin}
//             className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
//           >
//             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//             </svg>
//             Wave se Login karo
//           </button>

//           <p className="text-xs text-slate-500 text-center mt-4">
//             OAuth 2.0 ke through secure authentication
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, FileSpreadsheet, CheckCircle2, ArrowRight, Waves, KeyRound, ChevronDown } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const features = [
  { icon: Zap, label: 'Bulk Import', desc: 'Import 100+ invoices in under a minute' },
  { icon: Lock, label: 'OAuth Secure', desc: 'Authenticated via Wave OAuth 2.0' },
  { icon: FileSpreadsheet, label: 'Excel Native', desc: 'Works with .xlsx and .xls files' },
];

const MockDashboard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.7 }}
    className="animate-float relative mx-auto max-w-sm"
  >
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-500 px-4 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <span className="text-white text-xs font-medium ml-2 font-heading">InvoiceSync Dashboard</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex gap-2 mb-3">
          {['23 Ready', '2 Errors'].map((t, i) => (
            <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-medium ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{t}</span>
          ))}
        </div>
        {[
          { name: 'Acme Corp', amount: '$1,200.00', status: 'ready' },
          { name: 'Globe Ltd', amount: '$840.50', status: 'ready' },
          { name: 'Nova Inc', amount: '$350.00', status: 'error' },
        ].map((inv) => (
          <div key={inv.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${inv.status === 'error' ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                {inv.name[0]}
              </div>
              <span className="text-sm font-medium text-slate-700">{inv.name}</span>
            </div>
            <span className={`text-sm font-semibold ${inv.status === 'error' ? 'text-red-500' : 'text-slate-900'}`}>{inv.amount}</span>
          </div>
        ))}
        <div className="mt-3 w-full bg-gradient-to-r from-indigo-700 to-indigo-500 text-white text-xs font-semibold py-2 rounded-xl text-center">
          Import 21 Invoices →
        </div>
      </div>
    </div>
    {/* Glow */}
    <div className="absolute -inset-4 bg-indigo-400/10 rounded-3xl blur-2xl -z-10" />
  </motion.div>
);

export default function Login() {
  const navigate = useNavigate();
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/wave`;
  };

  const [showManual, setShowManual] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const handleManualLogin = async () => {
    if (!apiToken.trim()) {
      setManualError('Enter your Wave API token.');
      return;
    }
    setManualLoading(true);
    setManualError('');
    try {
      const res = await fetch(`${API_URL}/auth/manual`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error || 'Invalid API token.');
        return;
      }
      navigate('/dashboard');
    } catch {
      setManualError('Connection failed. Please check your network.');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left hero panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 w-[55%] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-heading font-bold text-lg tracking-tight">InvoiceSync</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl xl:text-6xl font-heading font-extrabold text-white leading-[1.1] mb-4"
          >
            Import 100 invoices<br />
            <span className="text-indigo-200">in 60 seconds.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-indigo-200 text-lg font-body mb-10 leading-relaxed"
          >
            Connect Wave, upload Excel, done. No manual entry ever again.
          </motion.p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-14">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                custom={3 + i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
              >
                <f.icon className="w-4 h-4 text-indigo-200" />
                <span className="text-white text-sm font-medium font-body">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <MockDashboard />
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex lg:hidden items-center gap-3 mb-10 justify-center"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-xl flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-heading font-bold text-lg">InvoiceSync</span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-10"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25">
                <Waves className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-1">Welcome back</h2>
              <p className="text-slate-500 font-body text-sm">Connect your Wave account to get started.</p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  custom={2 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 font-heading">{f.label}</p>
                    <p className="text-xs text-slate-500 font-body">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button with shimmer */}
            <motion.button
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              onClick={handleLogin}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-heading font-semibold py-3.5 px-6 rounded-xl min-h-[44px] flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-shadow duration-200"
            >
              {/* Shimmer overlay */}
              <span className="absolute inset-0 bg-shimmer animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Waves className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Connect with Wave</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            {/* Optional: manual API token login */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowManual((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 font-body py-2 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Or use an API token</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManual ? 'rotate-180' : ''}`} />
              </button>

              {showManual && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="border border-slate-200 rounded-xl p-4 mt-1 bg-slate-50/60">
                    <label className="block text-xs font-semibold text-slate-500 mb-2 font-body">
                      Wave API token <span className="text-slate-400 font-normal">(optional — only if you're not using Connect with Wave)</span>
                    </label>
                    <input
                      type="password"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
                      placeholder="Paste your Wave API token"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-2"
                    />
                    {manualError && (
                      <p className="text-xs text-red-500 font-body mb-2">{manualError}</p>
                    )}
                    <button
                      onClick={handleManualLogin}
                      disabled={manualLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold font-heading py-2.5 rounded-lg transition-colors"
                    >
                      {manualLoading ? 'Verifying…' : 'Continue with token'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Trust badge */}
            <motion.div
              custom={6}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-body"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit encrypted · No data stored · OAuth 2.0</span>
            </motion.div>
          </motion.div>

          <motion.p
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-center text-xs text-slate-400 mt-6 font-body"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
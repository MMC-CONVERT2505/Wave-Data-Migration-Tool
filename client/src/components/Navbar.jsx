import { Waves, CheckCircle2, LogOut, Building2, CreditCard, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ selectedBusiness, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isPayment = location.pathname === '/payments';
  const isExport = location.pathname.startsWith('/export');
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-slate-900 tracking-tight">
            Invoice<span className="text-indigo-600">Sync</span>
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {selectedBusiness && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-600 font-body max-w-[120px] truncate">
                {selectedBusiness?.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700 font-body">
              Connected to Wave
            </span>
          </div>

          <button
            onClick={() => navigate(isPayment ? '/dashboard' : '/payments')}
            className={`flex items-center gap-1.5 text-xs font-medium font-body px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${isPayment ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isPayment ? 'Invoices' : 'Payments'}</span>
          </button>

          <button
            onClick={() => navigate('/export/filter')}
            className={`flex items-center gap-1.5 text-xs font-medium font-body px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${isExport ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-body font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 min-h-[36px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
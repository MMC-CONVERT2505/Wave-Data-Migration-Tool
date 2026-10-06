import { Waves, FileText, CreditCard, Download, LogOut, Building2, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ selectedBusiness, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';
  const isPayment = location.pathname === '/payments';
  const isExport = location.pathname.startsWith('/export');

  const navItems = [
    { label: 'Invoices', icon: FileText, active: isDashboard, onClick: () => navigate('/dashboard') },
    { label: 'Payments', icon: CreditCard, active: isPayment, onClick: () => navigate('/payments') },
    { label: 'Export data', icon: Download, active: isExport, onClick: () => navigate('/export/filter') },
  ];

  return (
    <aside className="w-56 flex-shrink-0 bg-gradient-to-b from-indigo-950 to-indigo-900 min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
          <Waves className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-heading font-bold text-white tracking-tight text-[15px]">
          Invoice<span className="text-indigo-300">Sync</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 mb-6">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium font-body transition-colors text-left ${
              item.active
                ? 'bg-white text-indigo-700'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {selectedBusiness && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" />
            <span className="text-xs text-indigo-100 font-body truncate">{selectedBusiness?.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-300 font-body">Connected to Wave</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium font-body text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

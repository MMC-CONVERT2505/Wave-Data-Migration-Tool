import { Check } from 'lucide-react';

const STEPS = ['Company', 'Upload', 'Preview', 'Results'];

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = current > stepNum;
        const active = current === stepNum;

        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-heading transition-all duration-300 ${
                  done
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                    : active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : stepNum}
              </div>
              <span
                className={`text-sm font-medium font-body hidden sm:block transition-colors duration-200 ${
                  done ? 'text-emerald-600' : active ? 'text-indigo-700' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="w-10 sm:w-16 mx-2 h-px bg-slate-200 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-500"
                  style={{ width: done ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
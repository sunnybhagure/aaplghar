import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  // --- SUCCESS DESIGN (Top Minimal Bar) ---
  if (isSuccess) {
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 animate-in fade-in slide-in-from-top duration-300">
        <div className="bg-white border-l-4 border-green-500 shadow-xl rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-slate-700 font-bold text-sm tracking-tight">{message}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- ERROR/FAILURE DESIGN (Center Modal with OK Button) ---
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all px-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border-t-8 border-red-500 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
            Attention!
          </h3>
          
          <p className="text-slate-600 font-bold text-sm tracking-tight">
            {message}
          </p>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-black uppercase tracking-[2px] text-xs shadow-lg transform transition-all active:scale-95"
          >
            Got It (OK)
          </button>

          {/* Error Progress Bar */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 animate-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
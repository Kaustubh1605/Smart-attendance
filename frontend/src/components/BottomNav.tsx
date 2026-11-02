import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'subjects' | 'history' | 'materials' | 'profile';
  onSelectTab: (tab: 'home' | 'subjects' | 'history' | 'materials' | 'profile') => void;
  onOpenScanner?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenScanner }) => {
  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'home'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-current={currentTab === 'home' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'home' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
            >
              dashboard
            </span>
          </div>
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Subjects (NEW dedicated Searchable Subject-Wise Monthly Breakdown) */}
        <button
          onClick={() => onSelectTab('subjects')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'subjects'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-current={currentTab === 'subjects' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'subjects' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'subjects' ? "'FILL' 1" : "'FILL' 0" }}
            >
              analytics
            </span>
          </div>
          <span className="text-[10px] font-semibold">Subjects</span>
        </button>

        {/* Dedicated Center Elevated QR Scanner Action */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="relative -top-3.5 flex flex-col items-center justify-center shrink-0 cursor-pointer group px-1"
          title="Scan Classroom QR Code"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-emerald-600 p-[2.5px] shadow-[0_6px_20px_rgba(3,22,53,0.35)] group-hover:scale-108 group-active:scale-95 transition-all">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white border border-white/20">
              <span className="material-symbols-outlined text-[26px] text-emerald-400">
                qr_code_scanner
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-900 tracking-tight mt-0.5">SCAN</span>
        </button>

        {/* History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'history'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-current={currentTab === 'history' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'history' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}
            >
              history
            </span>
          </div>
          <span className="text-[10px] font-semibold">History</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'profile'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-current={currentTab === 'profile' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
            >
              account_circle
            </span>
          </div>
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

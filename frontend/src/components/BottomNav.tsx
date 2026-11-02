import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'history' | 'materials' | 'profile';
  onSelectTab: (tab: 'home' | 'history' | 'materials' | 'profile') => void;
  onOpenScanner?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenScanner }) => {
  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#e1e3e4] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#031635] font-semibold'
              : 'text-[#75777f] hover:text-[#191c1d]'
          }`}
          aria-current={currentTab === 'home' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'home' ? 'bg-[#d8e2ff] text-[#031635]' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
            >
              dashboard
            </span>
          </div>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'history'
              ? 'text-[#031635] font-semibold'
              : 'text-[#75777f] hover:text-[#191c1d]'
          }`}
          aria-current={currentTab === 'history' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'history' ? 'bg-[#d8e2ff] text-[#031635]' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}
            >
              history
            </span>
          </div>
          <span className="text-[10px] font-medium">History</span>
        </button>

        {/* Dedicated PhonePe-Style Center Elevated QR Scanner Action */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="relative -top-3.5 flex flex-col items-center justify-center shrink-0 cursor-pointer group px-1"
          title="Scan Classroom QR Code"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#031635] via-[#0d224d] to-[#00c853] p-[2.5px] shadow-[0_6px_16px_rgba(3,22,53,0.35)] group-hover:scale-108 group-active:scale-95 transition-all">
            <div className="w-full h-full rounded-full bg-[#031635] flex items-center justify-center text-white border border-white/20">
              <span className="material-symbols-outlined text-[26px] text-[#a0f399]">
                qr_code_scanner
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#031635] tracking-tight mt-0.5">SCAN</span>
        </button>

        {/* Study Materials */}
        <button
          onClick={() => onSelectTab('materials')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'materials'
              ? 'text-[#031635] font-semibold'
              : 'text-[#75777f] hover:text-[#191c1d]'
          }`}
          aria-current={currentTab === 'materials' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'materials' ? 'bg-[#d8e2ff] text-[#031635]' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'materials' ? "'FILL' 1" : "'FILL' 0" }}
            >
              menu_book
            </span>
          </div>
          <span className="text-[10px] font-medium">Materials</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
            currentTab === 'profile'
              ? 'text-[#031635] font-semibold'
              : 'text-[#75777f] hover:text-[#191c1d]'
          }`}
          aria-current={currentTab === 'profile' ? 'page' : undefined}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all ${
              currentTab === 'profile' ? 'bg-[#d8e2ff] text-[#031635]' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
            >
              account_circle
            </span>
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};

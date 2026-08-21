import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'history' | 'materials' | 'profile';
  onSelectTab: (tab: 'home' | 'history' | 'materials' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#e1e3e4] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
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
            className={`px-3.5 py-1 rounded-full transition-all ${
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
            className={`px-3.5 py-1 rounded-full transition-all ${
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
            className={`px-3.5 py-1 rounded-full transition-all ${
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
            className={`px-3.5 py-1 rounded-full transition-all ${
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

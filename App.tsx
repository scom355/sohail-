
import React, { useState } from 'react';
import { AppView } from './types';
import ChatPanel from './components/ChatPanel';
import GeneratePanel from './components/GeneratePanel';
import LivePanel from './components/LivePanel';
import POSPanel from './components/POSPanel';

const App: React.FC = () => {
  // Set POS as the default view so the user sees their request first
  const [activeView, setActiveView] = useState<AppView>(AppView.POS);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0f0f0f] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Carrefour POS</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            active={activeView === AppView.POS} 
            onClick={() => setActiveView(AppView.POS)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>}
            label="Billing Terminal"
          />
          <SidebarItem 
            active={activeView === AppView.CHAT} 
            onClick={() => setActiveView(AppView.CHAT)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.023 4.417 4.417 0 00-.193-1.81 7.157 7.157 0 01-1.573-2.324C3.411 13.656 3 12.873 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>}
            label="Customer Support"
          />
          <SidebarItem 
            active={activeView === AppView.GENERATE} 
            onClick={() => setActiveView(AppView.GENERATE)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>}
            label="Marketing Tools"
          />
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Terminal Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-300 font-medium">Online & Secure</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0a0a0a]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <h2 className="text-sm font-semibold text-white tracking-wide">CARREFOUR DIGITAL TERMINAL</h2>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] text-gray-500 font-bold uppercase">Cashier ID</span>
               <span className="text-xs text-gray-300">C-49201-DXB</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">U</div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-hidden">
          {activeView === AppView.CHAT && <ChatPanel />}
          {activeView === AppView.GENERATE && <GeneratePanel />}
          {activeView === AppView.LIVE && <LivePanel />}
          {activeView === AppView.POS && <POSPanel />}
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={active ? 'text-white' : 'text-gray-500'}>{icon}</span>
    {label}
  </button>
);

export default App;

import { LayoutDashboard, FileText, Settings, Plus } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'quotes' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'quotes' | 'settings') => void;
  onOpenNewQuote: () => void;
  providerName?: string;
}

export const Navbar = ({
  currentTab,
  setCurrentTab,
  onOpenNewQuote,
  providerName = 'Roviro Orçamentos'
}: NavbarProps) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
                  {providerName}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sinal PIX Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Propostas Comerciais de Alta Conversão
              </p>
            </div>
          </div>

          {/* Navigation Tabs & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </button>

              <button
                onClick={() => setCurrentTab('quotes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentTab === 'quotes'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Orçamentos</span>
              </button>

              <button
                onClick={() => setCurrentTab('settings')}
                className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all ${
                  currentTab === 'settings'
                    ? 'text-sky-400 bg-sky-500/20 border border-sky-500/30'
                    : ''
                }`}
                title="Configurações & Chave PIX"
              >
                <Settings className="w-4 h-4" />
              </button>
            </nav>

            {/* New Quote CTA */}
            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Orçamento</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

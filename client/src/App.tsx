import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { NewQuoteModal } from './components/NewQuoteModal';
import { DashboardPage } from './pages/DashboardPage';
import { QuotesListPage } from './pages/QuotesListPage';
import { PublicQuotePage } from './pages/PublicQuotePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'quotes' | 'settings'>('dashboard');
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [providerSettings, setProviderSettings] = useState<Record<string, string>>({});
  const [publicQuoteId, setPublicQuoteId] = useState<string | null>(null);

  // Detecta se a rota atual é de proposta pública (/proposta/:id ou #/proposta/:id)
  useEffect(() => {
    const checkPath = () => {
      const full = window.location.pathname + window.location.hash;
      const match = full.match(/(?:\/|#)proposta\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        setPublicQuoteId(match[1]);
      } else {
        setPublicQuoteId(null);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setProviderSettings(data);
    } catch {
      // Ignora erro menor na inicialização
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleViewPublicQuote = (id: string) => {
    window.location.hash = `/proposta/${id}`;
    setPublicQuoteId(id);
  };

  const handleBackToDashboard = () => {
    window.location.hash = '';
    setPublicQuoteId(null);
  };

  // Se o cliente acessou diretamente o link da proposta pública
  if (publicQuoteId) {
    return (
      <PublicQuotePage
        quoteId={publicQuoteId}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  const providerName = providerSettings.provider_name || 'Roviro Orçamentos';
  const defaultDeposit = parseInt(providerSettings.default_deposit_percent || '50', 10);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Barra de Demonstração Interativa */}
      <div className="bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 text-slate-300 text-xs py-2 px-4 border-b border-sky-500/20 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          <span className="font-bold text-white text-xs">Modo Demonstração Interativo</span>
          <span className="hidden sm:inline text-slate-400">• Emissão de Propostas, Assinatura Digital Touch e Sinal PIX ativos</span>
        </div>
        <a
          href="https://roviro.com.br#solucoes"
          className="text-sky-400 hover:text-sky-300 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <span>← Voltar ao Portfólio Roviro</span>
        </a>
      </div>

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewQuote={() => setIsNewQuoteOpen(true)}
        providerName={providerName}
      />

      {/* Pages */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onOpenNewQuote={() => setIsNewQuoteOpen(true)}
            onNavigateToQuotes={() => setCurrentTab('quotes')}
            onViewQuote={handleViewPublicQuote}
          />
        )}

        {currentTab === 'quotes' && (
          <QuotesListPage
            onOpenNewQuote={() => setIsNewQuoteOpen(true)}
            onViewQuote={handleViewPublicQuote}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage onSettingsSaved={loadSettings} />
        )}
      </main>

      {/* Modal Novo Orçamento */}
      <NewQuoteModal
        isOpen={isNewQuoteOpen}
        onClose={() => setIsNewQuoteOpen(false)}
        onQuoteCreated={() => {
          loadSettings();
        }}
        defaultDepositPercent={defaultDeposit}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{providerName}</span>
            <span>•</span>
            <span>Orçamento Express & Sinal PIX</span>
          </div>
          <div className="text-slate-400">
            Powered by <a href="https://roviro.com.br" target="_blank" rel="noreferrer" className="text-sky-400 font-semibold hover:underline">Roviro</a> • Feche mais projetos sem risco de inadimplência
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

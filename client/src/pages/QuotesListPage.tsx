import { useState, useEffect } from 'react';
import type { Quote } from '../types';
import { api } from '../services/api';
import { 
  Search, MessageCircle, Copy, Check, ExternalLink, 
  Trash2, QrCode, CheckCircle2, AlertCircle, Plus 
} from 'lucide-react';

interface QuotesListPageProps {
  onOpenNewQuote: () => void;
  onViewQuote: (id: string) => void;
}

export const QuotesListPage = ({
  onOpenNewQuote,
  onViewQuote
}: QuotesListPageProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQuotes = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuotes(selectedStatus);
      setQuotes(data);
    } catch (err) {
      console.error('Erro ao carregar lista de orçamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [selectedStatus]);

  const copyLink = (quoteId: string) => {
    const url = `${window.location.origin}/proposta/${quoteId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(quoteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openWhatsApp = (quote: Quote) => {
    const cleanPhone = quote.clientPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const link = `${window.location.origin}/proposta/${quote.id}`;

    const text = encodeURIComponent(`Olá *${quote.clientName}*! Tudo bem? 😊

Conforme combinamos, elaborei a proposta para o projeto:
📋 *${quote.title}*

💰 *Total:* R$ ${Number(quote.total).toFixed(2).replace('.', ',')}
⚡ *Sinal PIX (${quote.depositPercent}%):* R$ ${Number(quote.depositAmount).toFixed(2).replace('.', ',')}

Acesse o link abaixo para visualizar a proposta completa e aprovar com 1 clique:
👉 ${link}`);

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleMarkDepositPaid = async (quoteId: string) => {
    if (!confirm('Deseja confirmar o recebimento do sinal PIX deste orçamento?')) return;
    try {
      await api.markDepositPaid(quoteId);
      await loadQuotes();
    } catch (err: any) {
      alert('Erro ao confirmar sinal: ' + err.message);
    }
  };

  const handleCompleteQuote = async (quoteId: string) => {
    if (!confirm('Deseja marcar este orçamento como concluído/entregue?')) return;
    try {
      await api.updateQuoteStatus(quoteId, 'COMPLETED');
      await loadQuotes();
    } catch (err: any) {
      alert('Erro ao concluir orçamento: ' + err.message);
    }
  };

  const handleDelete = async (quoteId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o orçamento "${title}"?`)) return;
    try {
      await api.deleteQuote(quoteId);
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.clientName.toLowerCase().includes(term) ||
      q.title.toLowerCase().includes(term) ||
      String(q.quoteNumber).includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Aguardando Aprovação</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Aprovado pelo Cliente</span>;
      case 'DEPOSIT_PAID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Sinal PIX Pago</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Concluído / Entregue</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Gerenciador de Orçamentos & Propostas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o status de cada proposta, envie no WhatsApp e registre os adiantamentos de sinal.
          </p>
        </div>

        <button
          onClick={onOpenNewQuote}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Proposta</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, título ou #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 shadow-inner"
          />
        </div>

        {/* Status Tabs */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SENT', label: 'Aguardando' },
            { id: 'APPROVED', label: 'Aprovados' },
            { id: 'DEPOSIT_PAID', label: 'Sinal Pago' },
            { id: 'COMPLETED', label: 'Concluídos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Carregando propostas comerciais...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Nenhum orçamento encontrado neste filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuotes.map((q) => {
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl glass-card border-slate-800/80 hover:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">
                      #{q.quoteNumber}
                    </span>
                    {getStatusBadge(q.status)}
                    <span className="text-xs text-slate-400">• Válido por {q.validityDays} dias</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {q.title}
                    </h3>
                    <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{q.clientName}</span>
                      <span>•</span>
                      <span className="text-slate-400">{q.clientPhone}</span>
                      {q.clientAddress && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{q.clientAddress}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items summary */}
                  {q.items && q.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.items.slice(0, 3).map((it, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          {it.quantity}x {it.description}
                        </span>
                      ))}
                      {q.items.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                          +{q.items.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Center: Financials */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between md:justify-end gap-6 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total da Proposta
                    </span>
                    <span className="text-lg font-black text-white">
                      R$ {Number(q.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="border-l border-slate-800 pl-6">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Sinal PIX ({q.depositPercent}%)
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      R$ {Number(q.depositAmount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-end">
                  {/* WhatsApp Direct */}
                  <button
                    onClick={() => openWhatsApp(q)}
                    className="p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Enviar no WhatsApp do cliente"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  {/* Copy Public Link */}
                  <button
                    onClick={() => copyLink(q.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                    title="Copiar link público do cliente"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Link'}</span>
                  </button>

                  {/* View Public Page */}
                  <button
                    onClick={() => onViewQuote(q.id)}
                    className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Visualizar proposta pública"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver</span>
                  </button>

                  {/* Mark Deposit Paid Action */}
                  {q.status === 'APPROVED' && (
                    <button
                      onClick={() => handleMarkDepositPaid(q.id)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      title="Registrar recebimento do sinal PIX"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Confirmar Sinal</span>
                    </button>
                  )}

                  {/* Complete Quote */}
                  {q.status === 'DEPOSIT_PAID' && (
                    <button
                      onClick={() => handleCompleteQuote(q.id)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                      title="Marcar serviço como concluído e entregue"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir</span>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(q.id, q.title)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Excluir proposta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

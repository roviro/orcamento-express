import { useState, useEffect } from 'react';
import type { DashboardMetrics, Quote } from '../types';
import { api } from '../services/api';
import { 
  TrendingUp, CheckCircle, QrCode, Percent, Plus, 
  ArrowRight, FileText, Clock, ExternalLink 
} from 'lucide-react';

interface DashboardPageProps {
  onOpenNewQuote: () => void;
  onNavigateToQuotes: () => void;
  onViewQuote: (id: string) => void;
}

export const DashboardPage = ({
  onOpenNewQuote,
  onNavigateToQuotes,
  onViewQuote
}: DashboardPageProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [met, quotes] = await Promise.all([
        api.getMetrics(),
        api.getQuotes('ALL')
      ]);
      setMetrics(met);
      setRecentQuotes(quotes.slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Aguardando</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Aprovado</span>;
      case 'DEPOSIT_PAID':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Sinal Pago</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Concluído</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel Executivo de Propostas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Envie orçamentos profissionais e garanta até 50% de sinal de entrada via PIX antes de iniciar o trabalho.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewQuote}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Proposta</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quoted */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Orçado
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              R$ {Number(metrics?.totalAmountQuoted || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{metrics?.totalCount || 0}</span>
              <span>orçamentos emitidos</span>
            </div>
          </div>
        </div>

        {/* Total Approved */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Aprovado
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-400">
              R$ {Number(metrics?.totalApprovedAmount || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{metrics?.approvedCount || 0}</span>
              <span>propostas aprovadas</span>
            </div>
          </div>
        </div>

        {/* Deposit Collected */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sinais Recebidos (PIX)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              R$ {Number(metrics?.totalDepositCollected || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Caixa antecipado para materiais
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversão de Propostas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {Number(metrics?.conversionRate || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Índice de fechamento de negócios
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Últimos Orçamentos Enviados</span>
          </h3>

          <button
            onClick={onNavigateToQuotes}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Carregando orçamentos...
          </div>
        ) : recentQuotes.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Nenhum orçamento emitido ainda</p>
            <button
              onClick={onOpenNewQuote}
              className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold"
            >
              Criar Primeiro Orçamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4"># Proposta</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Título do Projeto</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Sinal PIX</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {q.clientName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {q.title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      R$ {Number(q.total).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                      R$ {Number(q.depositAmount).toFixed(2).replace('.', ',')}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">({q.depositPercent}%)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewQuote(q.id)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/20 font-semibold text-[11px] transition-all inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver Proposta</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

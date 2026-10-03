import { useState, useEffect } from 'react';
import type { Quote } from '../types';
import { api } from '../services/api';
import { 
  CheckCircle2, QrCode, Copy, Check, MessageCircle, 
  Printer, ShieldCheck, Clock, AlertCircle, ArrowLeft 
} from 'lucide-react';

interface PublicQuotePageProps {
  quoteId: string;
  onBackToDashboard?: () => void;
}

export const PublicQuotePage = ({
  quoteId,
  onBackToDashboard
}: PublicQuotePageProps) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadQuote = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPublicQuote(quoteId);
      setQuote(data.quote);
      setProvider(data.provider);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar proposta.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await api.approvePublicQuote(quoteId);
      setQuote(res.quote);
    } catch (err: any) {
      alert('Erro ao aprovar proposta: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const copyPixCode = () => {
    if (quote?.pixCopiaECola) {
      navigator.clipboard.writeText(quote.pixCopiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const openWhatsApp = () => {
    if (!provider || !quote) return;
    const clean = provider.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Estou visualizando a proposta #${quote.quoteNumber} ("${quote.title}") e gostaria de tirar uma dúvida.`);
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando proposta comercial segura...</p>
      </div>
    );
  }

  if (errorMsg || !quote) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-white">Proposta Não Encontrada</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Este link pode ter expirado ou foi cancelado pelo prestador de serviços.
        </p>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Voltar ao Início
          </button>
        )}
      </div>
    );
  }

  const isApproved = quote.status === 'APPROVED' || quote.status === 'DEPOSIT_PAID' || quote.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Floating Bar for Navigation / Print */}
        <div className="flex items-center justify-between no-print">
          {onBackToDashboard ? (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Main Proposal Paper Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                  Proposta Comercial Especializada
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                  {provider?.name || 'Roviro Soluções'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {provider?.specialty || 'Serviços Especializados'}
                </p>
                <div className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-3">
                  <span>📱 {provider?.phone}</span>
                  {provider?.email && <span>✉️ {provider?.email}</span>}
                  {provider?.address && <span>📍 {provider?.address}</span>}
                </div>
              </div>

              <div className="sm:text-right space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="text-xs font-semibold text-slate-400">Orçamento Oficial</div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">
                  #{quote.quoteNumber}
                </div>
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Válido por {quote.validityDays} dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Recipient & Project Title */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Cliente / Destinatário
                </span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {quote.clientName}
                </span>
                {quote.clientAddress && (
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    📍 {quote.clientAddress}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Orçamento Aprovado</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Aguardando Aprovação</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scope / Description */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {quote.title}
              </h2>
              {quote.description && (
                <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {quote.description}
                </p>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Discriminação dos Serviços & Materiais
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Item / Descrição</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4 text-center">Qtd</th>
                      <th className="py-3 px-4 text-right">Valor Unitário</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {quote.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">
                          {it.description}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            it.itemType === 'SERVICE'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : it.itemType === 'MATERIAL'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {it.itemType === 'SERVICE' ? 'Serviço' : it.itemType === 'MATERIAL' ? 'Material' : 'Mão de Obra'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {it.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          R$ {Number(it.unitPrice).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-white">
                          R$ {Number(it.total).toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-800">
              {/* Payment terms & Warranty */}
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Condições Comerciais
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {quote.paymentTerms || `${quote.depositPercent}% de sinal para reserva e início dos trabalhos.`}
                  </p>
                </div>

                {provider?.warranty && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Termo de Garantia</span>
                    </div>
                    <p className="leading-relaxed">{provider.warranty}</p>
                  </div>
                )}
              </div>

              {/* Total Calculation Box */}
              <div className="w-full sm:w-72 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>R$ {quote.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Desconto Comercial:</span>
                    <span>- R$ {quote.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total do Projeto:</span>
                  <span className="text-sky-400">
                    R$ {quote.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {quote.depositPercent > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-emerald-400 font-bold text-sm">
                    <span>Sinal PIX ({quote.depositPercent}%):</span>
                    <span>R$ {quote.depositAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Approval / PIX Call to Action */}
            <div className="pt-6 border-t border-slate-800 space-y-6">
              {!isApproved ? (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/50 via-indigo-950/40 to-slate-950 border border-sky-500/30 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Deseja fechar este projeto?
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      Clique no botão abaixo para aprovar a proposta e liberar os dados para pagamento do sinal de entrada via PIX.
                    </p>
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    {isApproving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Aprovar Orçamento & Ver Chave PIX</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* PIX Box for Approved Quote */
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <QrCode className="w-5 h-5" />
                      <span className="font-bold text-sm uppercase tracking-wider">
                        Pagamento do Sinal via PIX Oficial
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Valor do Sinal: <strong className="text-emerald-400 text-sm font-extrabold">R$ {quote.depositAmount.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {quote.pixQrCode && (
                      <div className="p-3 bg-white rounded-2xl w-44 h-44 flex-shrink-0 flex items-center justify-center shadow-lg">
                        <img
                          src={quote.pixQrCode}
                          alt="QR Code PIX do Sinal"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Código PIX Copia e Cola:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={quote.pixCopiaECola || ''}
                            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 font-mono select-all"
                          />
                          <button
                            type="button"
                            onClick={copyPixCode}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              copiedPix
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Abra o app do seu banco, escolha <strong>PIX Copia e Cola</strong> e cole o código acima para efetuar o adiantamento. O comprovante é validado automaticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct WhatsApp Contact Button */}
              <div className="text-center pt-2">
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Dúvidas? Conversar no WhatsApp com {provider?.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Proposta gerada eletronicamente através do <strong>Roviro Orçamento Express</strong>.
        </div>
      </div>
    </div>
  );
};

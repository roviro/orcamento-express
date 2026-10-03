import { useState } from 'react';
import type { QuoteItem, ItemType, Quote } from '../types';
import { api } from '../services/api';
import { 
  X, Plus, Trash2, CheckCircle2, MessageCircle, Copy, 
  ExternalLink, Check, User, FileText, ArrowRight 
} from 'lucide-react';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteCreated: () => void;
  defaultDepositPercent?: number;
}

export const NewQuoteModal = ({
  isOpen,
  onClose,
  onQuoteCreated,
  defaultDepositPercent = 50
}: NewQuoteModalProps) => {
  if (!isOpen) return null;

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('0');
  const [depositPercent, setDepositPercent] = useState<number>(defaultDepositPercent);
  const [validityDays, setValidityDays] = useState('7');
  const [notes, setNotes] = useState('');

  // Items State
  const [items, setItems] = useState<QuoteItem[]>([
    { description: 'Mão de obra e execução técnica especializada', itemType: 'SERVICE', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Loading & Result
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdQuote, setCreatedQuote] = useState<Quote | null>(null);
  const [whatsappPitch, setWhatsappPitch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Math calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  const discountVal = parseFloat(discount.replace(',', '.') || '0') || 0;
  const total = Math.max(0, subtotal - discountVal);
  const depositAmount = (total * depositPercent) / 100;

  const handleItemChange = (index: number, field: keyof QuoteItem, val: any) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(val || 0) : item.quantity;
        const price = field === 'unitPrice' ? Number(val || 0) : item.unitPrice;
        item.total = qty * price;
      }
      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: '', itemType: 'MATERIAL', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim() || !clientPhone.trim() || !title.trim()) {
      setErrorMsg('Por favor, preencha o nome do cliente, WhatsApp e título da proposta.');
      return;
    }

    const validItems = items.filter((it) => it.description.trim() && it.unitPrice > 0);
    if (validItems.length === 0) {
      setErrorMsg('Adicione pelo menos um item com descrição e valor unitário maior que zero.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        clientName: clientName.trim(),
        clientPhone: clientPhone.replace(/\D/g, ''),
        clientEmail: clientEmail.trim() || null,
        clientAddress: clientAddress.trim() || null,
        title: title.trim(),
        description: description.trim() || null,
        discount: discountVal,
        depositPercent,
        validityDays: parseInt(validityDays, 10) || 7,
        notes: notes.trim() || null,
        items: validItems
      };

      const res = await api.createQuote(payload);
      setCreatedQuote(res.quote);
      setWhatsappPitch(res.whatsappShareText);
      onQuoteCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao gerar orçamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const publicUrl = createdQuote ? `${window.location.origin}/proposta/${createdQuote.id}` : '';

  const copyPublicLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const openWhatsAppShare = () => {
    if (!createdQuote) return;
    const cleanPhone = createdQuote.clientPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappPitch)}`;
    window.open(url, '_blank');
  };

  const handleResetAndClose = () => {
    setCreatedQuote(null);
    setWhatsappPitch('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setTitle('');
    setDescription('');
    setDiscount('0');
    setDepositPercent(defaultDepositPercent);
    setValidityDays('7');
    setNotes('');
    setItems([{ description: 'Mão de obra e execução técnica', itemType: 'SERVICE', quantity: 1, unitPrice: 0, total: 0 }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {createdQuote ? 'Proposta Gerada com Sucesso!' : 'Criar Nova Proposta Comercial'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {createdQuote ? (
            /* Success State */
            <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Orçamento #{createdQuote.quoteNumber}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Proposta Pronta para Envio!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  O link público com cálculo de sinal PIX e visual executivo já está disponível para o cliente.
                </p>
              </div>

              {/* Financial Recap Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total do Orçamento</span>
                  <span className="text-base font-bold text-white">
                    R$ {createdQuote.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400 block font-semibold">
                    Sinal PIX ({createdQuote.depositPercent}%)
                  </span>
                  <span className="text-base font-extrabold text-emerald-400">
                    R$ {createdQuote.depositAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Public Link Box */}
              <div className="max-w-md mx-auto space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-300">
                  Link da Proposta do Cliente:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sky-400 select-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <button
                  onClick={openWhatsAppShare}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar no WhatsApp do Cliente</span>
                </button>

                <a
                  href={`/proposta/${createdQuote.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Proposta Como o Cliente Vê</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Voltar para lista de orçamentos
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Client Information */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. Dados do Cliente</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nome do Cliente ou Empresa *"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="WhatsApp com DDD (Ex: 11988887777) *"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email (opcional)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Endereço da Obra / Local (opcional)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Proposal Title & Overview */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Detalhes da Proposta</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do Orçamento (Ex: Armário Planejado Cozinha & Bancada) *"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>

                  <div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição geral dos serviços e especificações técnicas..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Dynamic Items List */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Itens, Materiais & Mão de Obra
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold hover:bg-sky-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2 items-start sm:items-center"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          required
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Descrição do item ou serviço *"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={it.itemType}
                          onChange={(e) => handleItemChange(idx, 'itemType', e.target.value as ItemType)}
                          className="px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500"
                        >
                          <option value="SERVICE">Serviço</option>
                          <option value="MATERIAL">Material</option>
                          <option value="LABOR">Mão de Obra</option>
                        </select>

                        <div className="w-16">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qtd"
                            className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.unitPrice || ''}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="R$ Unit"
                            className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-right focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="w-24 text-right font-semibold text-xs text-sky-400">
                          R$ {it.total.toFixed(2).replace('.', ',')}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Signal % & Terms */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  4. Condições de Pagamento & Sinal PIX
                </h4>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block font-medium">
                    Percentual de Sinal PIX para Início / Reserva:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 20, 30, 40, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDepositPercent(pct)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          depositPercent === pct
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pct === 0 ? 'Sem Sinal' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Desconto Comercial (R$)
                    </label>
                    <input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Validade da Proposta (Dias)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      placeholder="7"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Final Calculation Summary */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Desconto Aplicado:</span>
                      <span>- R$ {discountVal.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800 text-sm">
                    <span>Total da Proposta:</span>
                    <span className="text-sky-400">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {depositPercent > 0 && (
                    <div className="flex justify-between text-emerald-400 font-extrabold pt-1 text-sm bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <span>Sinal PIX Requerido ({depositPercent}%):</span>
                      <span>R$ {depositAmount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Gerar Proposta & Link WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

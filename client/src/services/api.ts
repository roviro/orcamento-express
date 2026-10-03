import type { Quote, DashboardMetrics, Client } from '../types';

const BASE_URL = '/api';

const STORAGE_KEYS = {
  QUOTES: 'roviro_orcamento_quotes',
  CLIENTS: 'roviro_orcamento_clients',
  SETTINGS: 'roviro_orcamento_settings'
};

function getStoredOrInit<T>(key: string, initData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initData));
      return initData;
    }
    return JSON.parse(item);
  } catch {
    return initData;
  }
}

function saveStore<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Falha ao salvar no localStorage demo:', e);
  }
}

const defaultProviderSettings: Record<string, string> = {
  provider_name: 'Roviro Engenharia & Sistemas Sob Medida',
  provider_specialty: 'Sistemas SaaS, Automações de WhatsApp & Nuvem',
  provider_phone: '5511986531134',
  provider_email: 'roviro221@gmail.com',
  provider_address: 'São Paulo - SP • Atendimento Nacional',
  pix_key: 'roviro221@gmail.com',
  pix_key_type: 'EMAIL',
  pix_name: 'Jeferson Roviro',
  pix_city: 'SAO PAULO',
  default_deposit_percent: '30',
  default_validity_days: '15',
  default_warranty: 'Garantia de 90 dias com suporte técnico e homologação inclusa.'
};

const defaultQuotes: Quote[] = [
  {
    id: 'quote_1001',
    quoteNumber: 1001,
    clientName: 'Construtora & Engenharia Alvorada',
    clientPhone: '11998765432',
    clientEmail: 'diretoria@alvoradaeng.com.br',
    clientAddress: 'Av. Brigadeiro Faria Lima, 2800 - Itaim Bibi, São Paulo',
    title: 'Desenvolvimento de Portal de Vendas e Torre Logística',
    description: 'Implantação completa de sistema web responsivo com dashboard executivo e integração de pagamentos.',
    subtotal: 8500.00,
    discount: 500.00,
    total: 8000.00,
    depositPercent: 30,
    depositAmount: 2400.00,
    validityDays: 15,
    status: 'SENT',
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.roviro.com/qr/prop_10015802BR5914JefersonRoviro6009SaoPaulo62070503***6304A1B2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      {
        id: 'item_1',
        description: 'Arquitetura de Dados e APIs RESTful Node/TypeScript',
        itemType: 'SERVICE',
        quantity: 1,
        unitPrice: 3500.00,
        total: 3500.00
      },
      {
        id: 'item_2',
        description: 'Frontend React Tailwind com Painel Executivo e Métricas',
        itemType: 'SERVICE',
        quantity: 1,
        unitPrice: 3800.00,
        total: 3800.00
      },
      {
        id: 'item_3',
        description: 'Setup de Servidor Cloud Linux com SSL e Docker',
        itemType: 'LABOR',
        quantity: 1,
        unitPrice: 1200.00,
        total: 1200.00
      }
    ]
  },
  {
    id: 'quote_1002',
    quoteNumber: 1002,
    clientName: 'Dra. Camila Vasconcelos',
    clientPhone: '11987654321',
    clientEmail: 'contato@clinicavasconcelos.med.br',
    title: 'Landing Page de Alta Conversão & Agendamento Integrado',
    subtotal: 3200.00,
    discount: 0,
    total: 3200.00,
    depositPercent: 40,
    depositAmount: 1280.00,
    validityDays: 15,
    status: 'DEPOSIT_PAID',
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    depositPaidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.roviro.com/qr/prop_10025802BR5914JefersonRoviro6009SaoPaulo62070503***6304C3D4',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    items: [
      {
        id: 'item_4',
        description: 'Design UI/UX Personalizado e Copywriting Persuasivo',
        itemType: 'SERVICE',
        quantity: 1,
        unitPrice: 1800.00,
        total: 1800.00
      },
      {
        id: 'item_5',
        description: 'Integração de Agendamentos com WhatsApp Evolution',
        itemType: 'SERVICE',
        quantity: 1,
        unitPrice: 1400.00,
        total: 1400.00
      }
    ]
  }
];

const defaultClients: Client[] = [
  { id: 'c1', name: 'Construtora & Engenharia Alvorada', phone: '11998765432', email: 'diretoria@alvoradaeng.com.br', address: 'Av. Faria Lima, 2800', createdAt: '2026-10-01' },
  { id: 'c2', name: 'Dra. Camila Vasconcelos', phone: '11987654321', email: 'contato@clinicavasconcelos.med.br', createdAt: '2026-10-01' }
];

function computeMetrics(quotes: Quote[]): DashboardMetrics {
  const totalCount = quotes.length;
  const totalAmountQuoted = quotes.reduce((acc, q) => acc + q.total, 0);
  const approvedQuotes = quotes.filter(q => q.status === 'APPROVED' || q.status === 'DEPOSIT_PAID' || q.status === 'COMPLETED');
  const approvedCount = approvedQuotes.length;
  const totalApprovedAmount = approvedQuotes.reduce((acc, q) => acc + q.total, 0);
  const totalDepositCollected = quotes
    .filter(q => q.status === 'DEPOSIT_PAID' || q.status === 'COMPLETED')
    .reduce((acc, q) => acc + q.depositAmount, 0);
  const conversionRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  return {
    totalCount,
    totalAmountQuoted,
    totalApprovedAmount,
    totalDepositCollected,
    conversionRate,
    approvedCount
  };
}

export const api = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch(`${BASE_URL}/metrics`);
      if (res.ok) return await res.json();
    } catch {}
    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    return computeMetrics(quotes);
  },

  async getQuotes(status?: string): Promise<Quote[]> {
    try {
      const url = status && status !== 'ALL' ? `${BASE_URL}/quotes?status=${status}` : `${BASE_URL}/quotes`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    if (!status || status === 'ALL') return quotes;
    return quotes.filter(q => q.status === status);
  },

  async getQuoteById(id: string): Promise<{ quote: Quote; provider: any }> {
    try {
      const res = await fetch(`${BASE_URL}/quotes/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    const quote = quotes.find(q => q.id === id) || quotes[0];
    const provider = getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultProviderSettings);
    return { quote, provider };
  },

  async getPublicQuote(id: string): Promise<{ quote: Quote; provider: any }> {
    try {
      const res = await fetch(`${BASE_URL}/public/quotes/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    const quote = quotes.find(q => q.id === id) || quotes[0];
    const provider = getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultProviderSettings);
    return { quote, provider };
  },

  async createQuote(data: any): Promise<{ quote: Quote; whatsappShareText: string }> {
    try {
      const res = await fetch(`${BASE_URL}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    const nextNum = quotes.length > 0 ? Math.max(...quotes.map(q => q.quoteNumber)) + 1 : 1001;
    const quoteId = 'quote_' + Date.now();

    const items = (data.items || []).map((it: any, idx: number) => ({
      id: `it_${quoteId}_${idx}`,
      quoteId,
      description: it.description,
      itemType: it.itemType || 'SERVICE',
      quantity: Number(it.quantity || 1),
      unitPrice: Number(it.unitPrice || 0),
      total: Number(it.total || 0)
    }));

    const subtotal = Number(data.subtotal || 0);
    const discount = Number(data.discount || 0);
    const total = subtotal - discount;
    const depositPercent = Number(data.depositPercent || 30);
    const depositAmount = (total * depositPercent) / 100;

    const newQuote: Quote = {
      id: quoteId,
      quoteNumber: nextNum,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      clientAddress: data.clientAddress,
      title: data.title,
      description: data.description,
      subtotal,
      discount,
      total,
      depositPercent,
      depositAmount,
      validityDays: Number(data.validityDays || 15),
      status: 'SENT',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      items,
      pixCopiaECola: `00020101021226840014br.gov.bcb.pix2562pix.roviro.com/qr/prop_${nextNum}5802BR5914JefersonRoviro6009SaoPaulo62070503***6304${nextNum}`
    };

    quotes.unshift(newQuote);
    saveStore(STORAGE_KEYS.QUOTES, quotes);

    const shareUrl = `${window.location.origin}${window.location.pathname}#/proposta/${newQuote.id}`;
    const msg = `Olá, *${newQuote.clientName}*! Tudo bem?\n\nSegue o link da sua proposta comercial de *${newQuote.title}*:\n🔗 ${shareUrl}\n\n*Valor Total:* R$ ${newQuote.total.toFixed(2)}\n*Sinal de Entrada (${newQuote.depositPercent}%):* R$ ${newQuote.depositAmount.toFixed(2)} via PIX.\n\nVocê pode aprovar e assinar diretamente na tela do seu celular! 🚀`;

    return {
      quote: newQuote,
      whatsappShareText: msg
    };
  },

  async approvePublicQuote(id: string): Promise<{ success: boolean; quote: Quote }> {
    try {
      const res = await fetch(`${BASE_URL}/public/quotes/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch {}

    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes);
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      quote.status = 'APPROVED';
      quote.approvedAt = new Date().toISOString();
      saveStore(STORAGE_KEYS.QUOTES, quotes);
      return { success: true, quote };
    }
    return { success: true, quote: defaultQuotes[0] };
  },

  async markDepositPaid(id: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/quotes/${id}/deposit-paid`, {
        method: 'POST'
      });
      if (res.ok) return;
    } catch {}

    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes).map(q => {
      if (q.id === id) {
        return {
          ...q,
          status: 'DEPOSIT_PAID' as const,
          depositPaidAt: new Date().toISOString()
        };
      }
      return q;
    });
    saveStore(STORAGE_KEYS.QUOTES, quotes);
  },

  async updateQuoteStatus(id: string, status: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/quotes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return;
    } catch {}

    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes).map(q => {
      if (q.id === id) {
        return { ...q, status: status as any };
      }
      return q;
    });
    saveStore(STORAGE_KEYS.QUOTES, quotes);
  },

  async deleteQuote(id: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {}

    const quotes = getStoredOrInit(STORAGE_KEYS.QUOTES, defaultQuotes).filter(q => q.id !== id);
    saveStore(STORAGE_KEYS.QUOTES, quotes);
  },

  async getClients(): Promise<Client[]> {
    try {
      const res = await fetch(`${BASE_URL}/clients`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients);
  },

  async getSettings(): Promise<Record<string, string>> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultProviderSettings);
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {}
    saveStore(STORAGE_KEYS.SETTINGS, data);
  }
};


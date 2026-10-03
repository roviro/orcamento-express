import type { Quote, DashboardMetrics, Client } from '../types';

const BASE_URL = '/api';

export const api = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${BASE_URL}/metrics`);
    if (!res.ok) throw new Error('Falha ao carregar métricas');
    return res.json();
  },

  async getQuotes(status?: string): Promise<Quote[]> {
    const url = status && status !== 'ALL' ? `${BASE_URL}/quotes?status=${status}` : `${BASE_URL}/quotes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar orçamentos');
    return res.json();
  },

  async getQuoteById(id: string): Promise<{ quote: Quote; provider: any }> {
    const res = await fetch(`${BASE_URL}/quotes/${id}`);
    if (!res.ok) throw new Error('Falha ao carregar orçamento');
    return res.json();
  },

  async getPublicQuote(id: string): Promise<{ quote: Quote; provider: any }> {
    const res = await fetch(`${BASE_URL}/public/quotes/${id}`);
    if (!res.ok) throw new Error('Proposta não encontrada');
    return res.json();
  },

  async createQuote(data: any): Promise<{ quote: Quote; whatsappShareText: string }> {
    const res = await fetch(`${BASE_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar orçamento');
    }
    return res.json();
  },

  async approvePublicQuote(id: string): Promise<{ success: boolean; quote: Quote }> {
    const res = await fetch(`${BASE_URL}/public/quotes/${id}/approve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Falha ao aprovar proposta');
    return res.json();
  },

  async markDepositPaid(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/quotes/${id}/deposit-paid`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Falha ao registrar pagamento do sinal');
  },

  async updateQuoteStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/quotes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status');
  },

  async deleteQuote(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/quotes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir proposta');
  },

  async getClients(): Promise<Client[]> {
    const res = await fetch(`${BASE_URL}/clients`);
    if (!res.ok) throw new Error('Falha ao carregar clientes');
    return res.json();
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao salvar configurações');
  }
};

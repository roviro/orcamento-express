export type ItemType = 'SERVICE' | 'MATERIAL' | 'LABOR';

export interface QuoteItem {
  id?: string;
  quoteId?: string;
  description: string;
  itemType: ItemType;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';

export interface Quote {
  id: string;
  quoteNumber: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  title: string;
  description?: string;
  subtotal: number;
  discount: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  paymentTerms?: string;
  validityDays: number;
  status: QuoteStatus;
  pixCopiaECola?: string;
  pixQrCode?: string;
  approvedAt?: string;
  depositPaidAt?: string;
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
}

export interface DashboardMetrics {
  totalCount: number;
  totalAmountQuoted: number;
  totalApprovedAmount: number;
  totalDepositCollected: number;
  conversionRate: number;
  approvedCount: number;
}

export interface ProviderSettings {
  provider_name?: string;
  provider_specialty?: string;
  provider_phone?: string;
  provider_email?: string;
  provider_address?: string;
  pix_key?: string;
  pix_key_type?: string;
  pix_name?: string;
  pix_city?: string;
  default_deposit_percent?: string;
  default_validity_days?: string;
  default_warranty?: string;
  evolution_api_url?: string;
  evolution_api_key?: string;
  evolution_instance?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

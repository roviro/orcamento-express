import axios from "axios";
import { settingsService } from "./settingsService";

export const whatsappService = {
  formatQuotePitch(quote: any, publicBaseUrl: string): string {
    const providerName = settingsService.get("provider_name", "Roviro Marcenaria & Design");
    const link = `${publicBaseUrl}/proposta/${quote.id}`;

    return `Olá *${quote.clientName}*! Tudo bem? 😊

Conforme conversamos, elaborei a proposta detalhada para o seu projeto:
📋 *${quote.title}*

💰 *Valor Total:* R$ ${Number(quote.total).toFixed(2).replace('.', ',')}
⚡ *Sinal para Início (${quote.depositPercent}%):* R$ ${Number(quote.depositAmount).toFixed(2).replace('.', ',')}
⏳ *Validade da Proposta:* ${quote.validityDays} dias

Para visualizar todos os itens detalhados, prazos e aprovar com 1 clique, acesse o link exclusivo abaixo:
👉 ${link}

Qualquer dúvida ou ajuste que precisar, estou à disposição!
Atenciosamente,
*${providerName}*`;
  },

  formatApprovalNotification(quote: any): string {
    return `🎉 *ORÇAMENTO APROVADO!*

O cliente *${quote.clientName}* acabou de aprovar a proposta:
📋 *#${quote.quoteNumber} — ${quote.title}*

💰 *Total do Projeto:* R$ ${Number(quote.total).toFixed(2).replace('.', ',')}
⚡ *Sinal PIX (${quote.depositPercent}%):* R$ ${Number(quote.depositAmount).toFixed(2).replace('.', ',')}
📱 *WhatsApp do Cliente:* ${quote.clientPhone}

Aguardando confirmação do pagamento do sinal para agendamento!`;
  },

  async sendMessage(phone: string, text: string): Promise<boolean> {
    const apiUrl = settingsService.get("evolution_api_url", "");
    const apiKey = settingsService.get("evolution_api_key", "");
    const instance = settingsService.get("evolution_instance", "default");

    if (!apiUrl || !apiKey) {
      console.log(`[WhatsApp Simulated] Disparo para ${phone}:\n${text}`);
      return false;
    }

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

      await axios.post(
        `${apiUrl}/message/sendText/${instance}`,
        {
          number: fullPhone,
          text: text,
          options: { delay: 1200, presence: "composing", linkPreview: true }
        },
        { headers: { apikey: apiKey } }
      );
      return true;
    } catch (err: any) {
      console.warn(`[WhatsApp] Falha ao enviar para ${phone}:`, err.message);
      return false;
    }
  }
};

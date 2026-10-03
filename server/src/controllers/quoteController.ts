import { Request, Response } from "express";
import { db } from "../db/database";
import { pixService } from "../services/pixService";
import { whatsappService } from "../services/whatsappService";
import { settingsService } from "../services/settingsService";

export const quoteController = {
  createQuote(req: Request, res: Response) {
    try {
      const {
        clientName,
        clientPhone,
        clientEmail,
        clientAddress,
        title,
        description,
        discount = 0,
        depositPercent = 50,
        paymentTerms,
        validityDays = 7,
        notes,
        items
      } = req.body;

      if (!clientName || !clientPhone || !title || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Nome, telefone, título e pelo menos um item são obrigatórios." });
      }

      // Calcula totais
      let subtotal = 0;
      for (const it of items) {
        const itemTotal = Number(it.quantity) * Number(it.unitPrice);
        subtotal += itemTotal;
      }

      const disc = Number(discount || 0);
      const total = Math.max(0, subtotal - disc);
      const depPercent = Number(depositPercent || 50);
      const depositAmount = (total * depPercent) / 100;

      // Gera número sequencial de orçamento (#1001 em diante)
      const lastQuote = db.prepare("SELECT MAX(quoteNumber) as maxNum FROM quotes").get() as any;
      const quoteNumber = (lastQuote?.maxNum || 1000) + 1;

      // Gera código PIX para o Sinal
      const pix = pixService.generateDepositPix(depositAmount, quoteNumber);

      const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const terms = paymentTerms || `${depPercent}% de sinal via PIX para reserva e início + saldo na entrega/conclusão.`;

      // Insere o orçamento
      db.prepare(`
        INSERT INTO quotes (
          id, quoteNumber, clientName, clientPhone, clientEmail, clientAddress,
          title, description, subtotal, discount, total, depositPercent, depositAmount,
          paymentTerms, validityDays, status, pixCopiaECola, notes, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SENT', ?, ?, ?)
      `).run(
        quoteId,
        quoteNumber,
        clientName.trim(),
        clientPhone.trim(),
        clientEmail ? clientEmail.trim() : null,
        clientAddress ? clientAddress.trim() : null,
        title.trim(),
        description ? description.trim() : null,
        subtotal,
        disc,
        total,
        depPercent,
        depositAmount,
        terms,
        Number(validityDays || 7),
        pix.copiaECola,
        notes ? notes.trim() : null,
        now
      );

      // Insere os itens
      const insertItem = db.prepare(`
        INSERT INTO quote_items (id, quoteId, description, itemType, quantity, unitPrice, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const it of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const iTotal = Number(it.quantity) * Number(it.unitPrice);
        insertItem.run(
          itemId,
          quoteId,
          it.description.trim(),
          it.itemType || "SERVICE",
          Number(it.quantity),
          Number(it.unitPrice),
          iTotal
        );
      }

      // Upsert rápido no cadastro de clientes para reaproveitamento
      try {
        const existingClient = db.prepare("SELECT id FROM clients WHERE phone = ?").get(clientPhone.trim()) as any;
        if (!existingClient) {
          const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          db.prepare(`
            INSERT INTO clients (id, name, phone, email, address, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            clientId,
            clientName.trim(),
            clientPhone.trim(),
            clientEmail || null,
            clientAddress || null,
            `Criado a partir do orçamento #${quoteNumber}`,
            now
          );
        }
      } catch (err) {
        console.warn("[Clients] Falha menor ao salvar cliente:", err);
      }

      const createdQuote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(quoteId) as any;
      const quoteItems = db.prepare("SELECT * FROM quote_items WHERE quoteId = ?").all(quoteId);

      const publicBaseUrl = req.headers.origin || "http://localhost:5175";
      const whatsappShareText = whatsappService.formatQuotePitch(createdQuote, publicBaseUrl);

      return res.status(201).json({
        quote: {
          ...createdQuote,
          items: quoteItems,
          pixQrCode: pix.qrCode
        },
        whatsappShareText
      });
    } catch (err: any) {
      console.error("[Quote Controller] Erro ao criar proposta:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  getAllQuotes(req: Request, res: Response) {
    try {
      const { status } = req.query;

      let query = "SELECT * FROM quotes";
      const params: any[] = [];

      if (status && status !== "ALL") {
        query += " WHERE status = ?";
        params.push(status);
      }

      query += " ORDER BY createdAt DESC";

      const quotes = db.prepare(query).all(...params) as any[];
      const getItems = db.prepare("SELECT * FROM quote_items WHERE quoteId = ?");

      const quotesWithItems = quotes.map((q) => {
        const pix = pixService.generateDepositPix(q.depositAmount, q.quoteNumber);
        return {
          ...q,
          items: getItems.all(q.id),
          pixQrCode: pix.qrCode
        };
      });

      return res.json(quotesWithItems);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getQuoteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;
      if (!quote) return res.status(404).json({ error: "Orçamento não encontrado." });

      const items = db.prepare("SELECT * FROM quote_items WHERE quoteId = ?").all(id);
      const pix = pixService.generateDepositPix(quote.depositAmount, quote.quoteNumber);

      const settings = settingsService.getAll();

      return res.json({
        quote: {
          ...quote,
          items,
          pixQrCode: pix.qrCode
        },
        provider: {
          name: settings.provider_name || "Roviro Soluções",
          specialty: settings.provider_specialty || "Prestação de Serviços Profissionais",
          phone: settings.provider_phone || "",
          email: settings.provider_email || "",
          address: settings.provider_address || "",
          warranty: settings.default_warranty || ""
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getPublicQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;
      if (!quote) return res.status(404).json({ error: "Proposta não encontrada ou expirada." });

      const items = db.prepare("SELECT * FROM quote_items WHERE quoteId = ?").all(id);
      const pix = pixService.generateDepositPix(quote.depositAmount, quote.quoteNumber);
      const settings = settingsService.getAll();

      return res.json({
        quote: {
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          clientName: quote.clientName,
          clientAddress: quote.clientAddress,
          title: quote.title,
          description: quote.description,
          subtotal: quote.subtotal,
          discount: quote.discount,
          total: quote.total,
          depositPercent: quote.depositPercent,
          depositAmount: quote.depositAmount,
          paymentTerms: quote.paymentTerms,
          validityDays: quote.validityDays,
          status: quote.status,
          pixCopiaECola: quote.pixCopiaECola || pix.copiaECola,
          pixQrCode: pix.qrCode,
          approvedAt: quote.approvedAt,
          depositPaidAt: quote.depositPaidAt,
          notes: quote.notes,
          createdAt: quote.createdAt,
          items
        },
        provider: {
          name: settings.provider_name || "Roviro Soluções",
          specialty: settings.provider_specialty || "Prestação de Serviços Especializados",
          phone: settings.provider_phone || "5511986531134",
          email: settings.provider_email || "contato@roviro.com.br",
          address: settings.provider_address || "São Paulo - SP",
          warranty: settings.default_warranty || "Garantia de 12 meses contra defeitos de execução."
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  approvePublicQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;
      if (!quote) return res.status(404).json({ error: "Proposta não encontrada." });

      const now = new Date().toISOString();
      db.prepare(`
        UPDATE quotes 
        SET status = CASE WHEN status = 'SENT' THEN 'APPROVED' ELSE status END,
            approvedAt = COALESCE(approvedAt, ?)
        WHERE id = ?
      `).run(now, id);

      const updated = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;

      // Dispara notificação para o prestador
      const providerPhone = settingsService.get("provider_phone", "5511986531134");
      const alertMsg = whatsappService.formatApprovalNotification(updated);
      whatsappService.sendMessage(providerPhone, alertMsg);

      return res.json({
        success: true,
        message: "Proposta aprovada com sucesso!",
        quote: updated
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  markDepositPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;
      if (!quote) return res.status(404).json({ error: "Orçamento não encontrado." });

      const now = new Date().toISOString();
      db.prepare(`
        UPDATE quotes 
        SET status = 'DEPOSIT_PAID', depositPaidAt = ?
        WHERE id = ?
      `).run(now, id);

      return res.json({ success: true, status: "DEPOSIT_PAID" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      db.prepare("UPDATE quotes SET status = ? WHERE id = ?").run(status, id);
      return res.json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM quote_items WHERE quoteId = ?").run(id);
      db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getDashboardMetrics(req: Request, res: Response) {
    try {
      const allQuotes = db.prepare("SELECT * FROM quotes").all() as any[];

      const totalCount = allQuotes.length;
      let totalAmountQuoted = 0;
      let totalApprovedAmount = 0;
      let totalDepositCollected = 0;
      let approvedCount = 0;

      for (const q of allQuotes) {
        totalAmountQuoted += q.total;

        if (q.status === "APPROVED" || q.status === "DEPOSIT_PAID" || q.status === "COMPLETED") {
          totalApprovedAmount += q.total;
          approvedCount += 1;
        }

        if (q.status === "DEPOSIT_PAID" || q.status === "COMPLETED") {
          totalDepositCollected += q.depositAmount;
        }
      }

      const conversionRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

      return res.json({
        totalCount,
        totalAmountQuoted,
        totalApprovedAmount,
        totalDepositCollected,
        conversionRate,
        approvedCount
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};

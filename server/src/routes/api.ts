import { Router } from "express";
import { quoteController } from "../controllers/quoteController";
import { clientController } from "../controllers/clientController";
import { settingsController } from "../controllers/settingsController";

export const apiRouter = Router();

// Rotas Públicas (Acesso do Cliente Final)
apiRouter.get("/public/quotes/:id", quoteController.getPublicQuote);
apiRouter.post("/public/quotes/:id/approve", quoteController.approvePublicQuote);

// Gestão de Orçamentos (Prestador)
apiRouter.get("/quotes", quoteController.getAllQuotes);
apiRouter.post("/quotes", quoteController.createQuote);
apiRouter.get("/quotes/:id", quoteController.getQuoteById);
apiRouter.patch("/quotes/:id/status", quoteController.updateStatus);
apiRouter.post("/quotes/:id/deposit-paid", quoteController.markDepositPaid);
apiRouter.delete("/quotes/:id", quoteController.deleteQuote);

// Métricas do Dashboard
apiRouter.get("/metrics", quoteController.getDashboardMetrics);

// Clientes Frequentes
apiRouter.get("/clients", clientController.getAllClients);
apiRouter.post("/clients", clientController.createClient);
apiRouter.delete("/clients/:id", clientController.deleteClient);

// Configurações do Prestador & Chave PIX
apiRouter.get("/settings", settingsController.getSettings);
apiRouter.post("/settings", settingsController.updateSettings);

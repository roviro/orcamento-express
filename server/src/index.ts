import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { initDatabase } from "./db/database";
import { apiRouter } from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003; // Porta 3003 dedicada para a Fase 3!

app.use(cors());
app.use(express.json());

// Inicializa banco de dados SQLite e seed inicial
initDatabase();

// Rotas da API
app.use("/api", apiRouter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Roviro Orçamento Express API",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend compilado se existir
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
  console.log(`📦 Servindo orçamentos web a partir de: ${clientDistPath}`);
} else {
  app.use((req, res) => {
    res.send(`
      <div style="font-family: sans-serif; background: #080c14; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <h1 style="color: #38bdf8;">Roviro Orçamento Express — API Backend</h1>
        <p style="color: #94a3b8;">O backend está ativo na porta ${PORT}.</p>
        <p>Acesse a interface web em: <a href="http://localhost:5175" style="color: #38bdf8; font-weight: bold;">http://localhost:5175</a></p>
      </div>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor Orçamento Express rodando em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

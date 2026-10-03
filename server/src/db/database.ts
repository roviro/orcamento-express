import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "orcamentos.db");
export const db = new Database(dbPath);

// Ativa WAL mode para concorrência e alta velocidade
db.exec("PRAGMA journal_mode = WAL;");

export function initDatabase() {
  // Configurações do prestador
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Clientes frequentes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Orçamentos / Propostas
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      quoteNumber INTEGER UNIQUE NOT NULL,
      clientName TEXT NOT NULL,
      clientPhone TEXT NOT NULL,
      clientEmail TEXT,
      clientAddress TEXT,
      title TEXT NOT NULL,
      description TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      depositPercent REAL NOT NULL,
      depositAmount REAL NOT NULL,
      paymentTerms TEXT,
      validityDays INTEGER DEFAULT 7,
      status TEXT CHECK(status IN ('DRAFT', 'SENT', 'APPROVED', 'DEPOSIT_PAID', 'COMPLETED', 'CANCELLED')) DEFAULT 'SENT',
      pixCopiaECola TEXT,
      approvedAt TEXT,
      depositPaidAt TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Itens do orçamento
  db.exec(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quoteId TEXT NOT NULL,
      description TEXT NOT NULL,
      itemType TEXT CHECK(itemType IN ('SERVICE', 'MATERIAL', 'LABOR')) DEFAULT 'SERVICE',
      quantity REAL NOT NULL,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
    );
  `);

  seedData();
}

function seedData() {
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as any;
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    insertSetting.run("provider_name", "Roviro Marcenaria & Design de Interiores");
    insertSetting.run("provider_specialty", "Marcenaria Fina, Móveis Planejados e Reformas");
    insertSetting.run("provider_phone", "5511986531134");
    insertSetting.run("provider_email", "contato@roviro.com.br");
    insertSetting.run("provider_address", "São Paulo - SP");
    insertSetting.run("pix_key", "roviro221@gmail.com");
    insertSetting.run("pix_key_type", "EMAIL");
    insertSetting.run("pix_name", "Roviro Solucoes Digitais");
    insertSetting.run("pix_city", "SAO PAULO");
    insertSetting.run("default_deposit_percent", "50");
    insertSetting.run("default_validity_days", "7");
    insertSetting.run(
      "default_warranty",
      "Garantia total de 12 meses contra defeitos de fabricação e montagem. Materiais 100% MDF primeira linha com corrediças telescópicas e amortecimento soft-close."
    );
  }

  const quotesCount = db.prepare("SELECT COUNT(*) as count FROM quotes").get() as any;
  if (quotesCount.count === 0) {
    const now = new Date().toISOString();

    // 1. Armário Cozinha (Approved)
    db.prepare(`
      INSERT INTO quotes (
        id, quoteNumber, clientName, clientPhone, clientEmail, clientAddress,
        title, description, subtotal, discount, total, depositPercent, depositAmount,
        paymentTerms, validityDays, status, pixCopiaECola, approvedAt, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "quote_1001",
      1001,
      "Dra. Juliana Mendes",
      "11987654321",
      "juliana.mendes@email.com",
      "Rua Bela Cintra, 890 - Consolação, SP",
      "Armário Planejado para Cozinha & Cristaleira em Vidro Reflecta",
      "Projeto executivo e fabricação sob medida de móveis para cozinha integrada e cristaleira com perfis de alumínio preto e iluminação LED embutida.",
      6800.00,
      0,
      6800.00,
      50,
      3400.00,
      "50% de sinal via PIX para início da fabricação + 50% na finalização e entrega.",
      10,
      "APPROVED",
      null,
      now,
      "Entrega prevista em até 18 dias úteis após medição final.",
      now
    );

    const insertItem = db.prepare(`
      INSERT INTO quote_items (id, quoteId, description, itemType, quantity, unitPrice, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run("item_101", "quote_1001", "Armário superior 2,40m com portas basculantes e pistões a gás", "SERVICE", 1, 2400.00, 2400.00);
    insertItem.run("item_102", "quote_1001", "Gabinete inferior para pia em MDF Ultra Naval com 4 gavetões soft-close", "SERVICE", 1, 2200.00, 2200.00);
    insertItem.run("item_103", "quote_1001", "Cristaleira vertical com 2 portas de vidro reflecta e perfil bronze", "MATERIAL", 1, 1600.00, 1600.00);
    insertItem.run("item_104", "quote_1001", "Instalação de fitas LED 3000K quente com perfil de alumínio e fonte oculta", "LABOR", 1, 600.00, 600.00);

    // 2. Bancada Home Office (Deposit Paid)
    db.prepare(`
      INSERT INTO quotes (
        id, quoteNumber, clientName, clientPhone, clientEmail, clientAddress,
        title, description, subtotal, discount, total, depositPercent, depositAmount,
        paymentTerms, validityDays, status, pixCopiaECola, approvedAt, depositPaidAt, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "quote_1002",
      1002,
      "Marcos Vinicius Rezende",
      "11977778888",
      "marcos.rezende@tech.com",
      "Av. Brigadeiro Faria Lima, 2200 - Pinheiros, SP",
      "Bancada Suspensa Home Office com Painel Ripado",
      "Bancada ergonômica com calha passa-cabos oculta, painel ripado freijó e gaveteiro volante com fechadura.",
      2450.00,
      50.00,
      2400.00,
      40,
      960.00,
      "40% de sinal no aceite (R$ 960,00) e saldo restante parcelado no cartão em 3x.",
      7,
      "DEPOSIT_PAID",
      null,
      now,
      now,
      "Instalação agendada para próxima terça-feira.",
      now
    );

    insertItem.run("item_201", "quote_1002", "Bancada suspensa 1,60m x 0,60m em MDF Carvalho com passa-fios", "SERVICE", 1, 1200.00, 1200.00);
    insertItem.run("item_202", "quote_1002", "Painel ripado decorativo em madeira freijó 2,20m x 1,20m", "MATERIAL", 1, 850.00, 850.00);
    insertItem.run("item_203", "quote_1002", "Gaveteiro móvel com rodízios de silicone e 3 gavetas com trava", "SERVICE", 1, 400.00, 400.00);

    // 3. Reforma de Portas (Sent)
    db.prepare(`
      INSERT INTO quotes (
        id, quoteNumber, clientName, clientPhone, clientEmail, clientAddress,
        title, description, subtotal, discount, total, depositPercent, depositAmount,
        paymentTerms, validityDays, status, pixCopiaECola, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "quote_1003",
      1003,
      "Camila Siqueira",
      "11966665555",
      "camila.s@gmail.com",
      "Rua Pamplona, 340 - Jardim Paulista, SP",
      "Manutenção e Troca de Ferragens de Armários Embutidos",
      "Alinhamento geral de 8 portas, substituição de 16 dobradiças por modelos com amortecimento e lubrificação de corrediças.",
      850.00,
      0,
      850.00,
      50,
      425.00,
      "50% de sinal para reserva da data e compra das ferragens + 50% na conclusão.",
      5,
      "SENT",
      null,
      "Execução em 1 dia útil.",
      now
    );

    insertItem.run("item_301", "quote_1003", "Kit 16x Dobradiças caneco 35mm com amortecimento soft-close", "MATERIAL", 1, 350.00, 350.00);
    insertItem.run("item_302", "quote_1003", "Mão de obra técnica de alinhamento, furação e regulagem de portas", "LABOR", 1, 500.00, 500.00);
  }
}

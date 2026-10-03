# 📑 Roviro Orçamento Express • Propostas Comerciais com Sinal PIX

> Plataforma completa de **Geração de Propostas Comerciais e Orçamentos com Sinal PIX Automático** para autônomos, marceneiros, técnicos de climatização, eletricistas, vidraceiros, designers e prestadores de serviços.

---

## 🎯 Por que Este Produto Vende Tanto?

1. **Fim do Amadorismo**: O prestador de serviço para de mandar mensagens desorganizadas ou arquivos no Word. Ele envia um link com visual executivo e moderno.
2. **Fim do Prejuízo com Materiais**: O sistema calcula e cobra automaticamente um **Sinal de Entrada via PIX (ex: 30% a 50%)** com QR Code e chave Copia e Cola imediata, garantindo que o prestador nunca compre insumos do próprio bolso.
3. **Fechamento Ágil no WhatsApp**: O cliente abre a proposta no smartphone, confere os itens e clica em **[Aprovar Orçamento]** em menos de 1 minuto.

---

## 🚀 Funcionalidades Principais

1. **Dashboard & Indicadores de Performance**:
   - Total em propostas orçadas (R$).
   - Total em propostas aprovadas (R$).
   - Total de sinais recebidos via PIX (R$).
   - Taxa de conversão de fechamento (%).

2. **Construtor Dinâmico de Orçamentos**:
   - Cadastro ágil do cliente (Nome, WhatsApp, Endereço da obra).
   - Adição de múltiplos itens categorizados por **Serviço**, **Material** e **Mão de Obra**.
   - Cálculo automático de subtotal, descontos comerciais e total.
   - **Seletor de % de Sinal** (0%, 20%, 30%, 40%, 50%, 100%) calculando na hora o adiantamento requerido.
   - Prazo de validade da proposta em dias (ex: 7 dias) e termo de garantia.

3. **Página Pública da Proposta para o Cliente Final (`/proposta/:id`)**:
   - Layout de altíssima conversão e credibilidade.
   - Discriminação de cada serviço, material e garantias.
   - Botão **[Aprovar Orçamento & Liberar Chave PIX]**.
   - Bloco interativo do PIX com **QR Code dinâmico** e botão de **Copiar Código Copia e Cola** com checksum Bacen CRC16.
   - Botão direto de WhatsApp para tirar dúvidas com o prestador.
   - Botão de Imprimir / Salvar em PDF (`Ctrl + P`).

4. **Gerenciador de Propostas**:
   - Filtros por status: Aguardando (`SENT`), Aprovados (`APPROVED`), Sinal Pago (`DEPOSIT_PAID`), Concluídos (`COMPLETED`).
   - Botão de 1 clique para gerar texto de apresentação e abrir o WhatsApp do cliente.
   - Botão de confirmação de pagamento do sinal.

5. **Configurações do Prestador & Chave PIX**:
   - Identidade da empresa, especialidade e contatos.
   - Chave PIX (CPF, CNPJ, Email ou Celular), titular e cidade.
   - Prazos e termo de garantia padrão.

---

## 🛠️ Tecnologias

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Bun / Node.js, Express, SQLite (`bun:sqlite` nativo ultrarrápido).
- **Integração Financeira**: Motor Bacen EMVCo para geração de PIX Copia e Cola & QR Code SVG.
- **Integração WhatsApp**: Gerador de textos de pitch e webhooks da Evolution API.

---

## 🏃 Como Executar

### Inicialização em 1 Comando:
```bash
./iniciar.sh
```

- **Painel do Prestador**: `http://localhost:5175`
- **Página de Exemplo de Proposta**: `http://localhost:5175/proposta/quote_1001`
- **API Backend**: `http://localhost:3003`

---

## 💰 Modelo de Monetização Sugerido

- **Assinatura Recorrente**: R$ 49 a R$ 89 / mês por profissional autônomo.
- **Setup e Customização**: R$ 300 a R$ 600 para configurar a marca do cliente, logo, termos de garantia e chave PIX.

---

Desenvolvido com a arquitetura de excelência da **Roviro Dev & Arch**.

#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "  ROVIRO ORÇAMENTO EXPRESS — PROPOSTAS COM SINAL PIX      "
echo "=========================================================="

trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Iniciando backend em http://localhost:3003..."
(cd "$ROOT_DIR/server" && bun run src/index.ts) &

echo "Iniciando frontend em http://localhost:5175..."
(cd "$ROOT_DIR/client" && bun run dev) &

wait

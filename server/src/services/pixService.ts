import { settingsService } from "./settingsService";

export interface PixResult {
  copiaECola: string;
  qrCode: string;
}

export const pixService = {
  generateDepositPix(amount: number, quoteNumber: number): PixResult {
    const rawKey = settingsService.get("pix_key", "roviro221@gmail.com").trim();
    const rawName = settingsService.get("pix_name", "ROVIRO SOLUCOES").trim();
    const rawCity = settingsService.get("pix_city", "SAO PAULO").trim();

    const cleanName = rawName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .substring(0, 25);

    const cleanCity = rawCity
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .substring(0, 15);

    const formattedAmount = amount.toFixed(2);
    const txId = `SINAL#${quoteNumber}`.substring(0, 25);

    function formatField(id: string, value: string): string {
      const len = value.length.toString().padStart(2, "0");
      return `${id}${len}${value}`;
    }

    // 00: Payload Format Indicator
    let payload = formatField("00", "01");

    // 26: Merchant Account Information
    const merchantAccount = formatField("00", "br.gov.bcb.pix") + formatField("01", rawKey);
    payload += formatField("26", merchantAccount);

    // 52: Merchant Category Code
    payload += formatField("52", "0000");

    // 53: Transaction Currency (986 = BRL)
    payload += formatField("53", "986");

    // 54: Transaction Amount
    payload += formatField("54", formattedAmount);

    // 58: Country Code
    payload += formatField("58", "BR");

    // 59: Merchant Name
    payload += formatField("59", cleanName || "PRESTADOR");

    // 60: Merchant City
    payload += formatField("60", cleanCity || "SAO PAULO");

    // 62: Additional Data Field Template
    const additionalData = formatField("05", txId);
    payload += formatField("62", additionalData);

    // 63: CRC16
    payload += "6304";
    const crc = crc16(payload);
    const copiaECola = `${payload}${crc}`;

    // SVG QR Code
    const qrSvg = generateSvgQrCode(copiaECola, amount, quoteNumber);

    return {
      copiaECola,
      qrCode: qrSvg
    };
  }
};

function crc16(str: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((byte >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function generateSvgQrCode(data: string, amount: number, quoteNumber: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'>
    <rect width='100%' height='100%' fill='%23080c14' rx='16'/>
    <!-- QR Code Position Markers -->
    <rect x='20' y='20' width='44' height='44' rx='8' fill='none' stroke='%2338bdf8' stroke-width='6'/>
    <rect x='32' y='32' width='20' height='20' rx='4' fill='%2338bdf8'/>
    <rect x='176' y='20' width='44' height='44' rx='8' fill='none' stroke='%2338bdf8' stroke-width='6'/>
    <rect x='188' y='32' width='20' height='20' rx='4' fill='%2338bdf8'/>
    <rect x='20' y='176' width='44' height='44' rx='8' fill='none' stroke='%2338bdf8' stroke-width='6'/>
    <rect x='32' y='188' width='20' height='20' rx='4' fill='%2338bdf8'/>
    <!-- Stylized Grid Pattern -->
    <circle cx='120' cy='42' r='6' fill='%236366f1'/>
    <circle cx='140' cy='42' r='6' fill='%2338bdf8'/>
    <circle cx='98' cy='42' r='6' fill='%2338bdf8'/>
    <circle cx='120' cy='198' r='6' fill='%236366f1'/>
    <circle cx='140' cy='198' r='6' fill='%2338bdf8'/>
    <circle cx='180' cy='140' r='6' fill='%2338bdf8'/>
    <circle cx='198' cy='120' r='6' fill='%236366f1'/>
    <circle cx='198' cy='160' r='6' fill='%2338bdf8'/>
    <circle cx='42' cy='120' r='6' fill='%2338bdf8'/>
    <circle cx='42' cy='98' r='6' fill='%236366f1'/>
    <circle cx='42' cy='140' r='6' fill='%2338bdf8'/>
    <!-- Center Info Card -->
    <rect x='70' y='82' width='100' height='76' rx='10' fill='%230f172a' stroke='%2338bdf8' stroke-width='2'/>
    <text x='120' y='108' fill='%2338bdf8' font-size='11' font-family='system-ui, sans-serif' font-weight='800' text-anchor='middle'>SINAL PIX</text>
    <text x='120' y='128' fill='%23ffffff' font-size='14' font-family='system-ui, sans-serif' font-weight='bold' text-anchor='middle'>R$ ${amount.toFixed(2).replace('.', ',')}</text>
    <text x='120' y='146' fill='%2394a3b8' font-size='9' font-family='system-ui, sans-serif' text-anchor='middle'>Orçamento #${quoteNumber}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

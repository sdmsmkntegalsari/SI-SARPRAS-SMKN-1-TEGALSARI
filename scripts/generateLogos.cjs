const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. SVG LOGO PROVINSI JAWA TIMUR
const svgJatim = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <defs>
    <!-- Gradients -->
    <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>
    <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E88E5" />
      <stop offset="100%" stop-color="#0D47A1" />
    </linearGradient>
    <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="50%" stop-color="#FDD835" />
      <stop offset="100%" stop-color="#F57F17" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Outer Pentagon Shield (Emas) -->
  <polygon points="200,15 375,70 345,380 200,465 55,380 25,70" fill="url(#shieldGold)" stroke="#3E2723" stroke-width="6" />

  <!-- Black Border Trim -->
  <polygon points="200,28 360,78 333,370 200,450 67,370 40,78" fill="#1A237E" stroke="#FFD54F" stroke-width="4" />

  <!-- Inner Blue Shield -->
  <polygon points="200,38 348,84 322,360 200,436 78,360 52,84" fill="url(#shieldBlue)" />

  <!-- Bintang Emas di Puncak -->
  <polygon points="200,45 208,68 232,68 213,82 220,105 200,91 180,105 187,82 168,68 192,68" fill="url(#starGold)" stroke="#D84315" stroke-width="1.5" />

  <!-- Candi Bentar (Gapura Majapahit Jawa Timur) Merah Bata -->
  <!-- Sayap Candi Kiri -->
  <path d="M125,290 L125,185 L145,185 L145,160 L165,160 L165,135 L180,135 L180,115 L190,115 L190,290 Z" fill="#D32F2F" stroke="#B71C1C" stroke-width="2" />
  <rect x="135" y="195" width="20" height="10" fill="#FFCDD2" />
  <rect x="150" y="170" width="20" height="10" fill="#FFCDD2" />
  <rect x="165" y="145" width="20" height="10" fill="#FFCDD2" />

  <!-- Sayap Candi Kanan -->
  <path d="M275,290 L275,185 L255,185 L255,160 L235,160 L235,135 L220,135 L220,115 L210,115 L210,290 Z" fill="#D32F2F" stroke="#B71C1C" stroke-width="2" />
  <rect x="245" y="195" width="20" height="10" fill="#FFCDD2" />
  <rect x="230" y="170" width="20" height="10" fill="#FFCDD2" />
  <rect x="215" y="145" width="20" height="10" fill="#FFCDD2" />

  <!-- Tugu Pahlawan di Celah Gapura -->
  <polygon points="195,145 205,145 203,260 197,260" fill="#EEEEEE" stroke="#9E9E9E" stroke-width="1" />
  <polygon points="200,125 205,145 195,145" fill="#FFFFFF" />

  <!-- Gelombang Air Biru-Putih di Bawah Gapura -->
  <path d="M110,290 Q155,305 200,290 Q245,305 290,290 L290,325 Q245,340 200,325 Q155,340 110,325 Z" fill="#0D47A1" stroke="#64B5F6" stroke-width="3" />
  <path d="M120,305 Q160,318 200,305 Q240,318 280,305" stroke="#FFFFFF" stroke-width="3" fill="none" />
  <path d="M130,320 Q165,332 200,320 Q235,332 270,320" stroke="#FFFFFF" stroke-width="2.5" fill="none" />

  <!-- Untaian Padi (Kiri - Kuning Emas) -->
  <g fill="#FBC02D" stroke="#F57F17" stroke-width="1.5">
    <ellipse cx="88" cy="170" rx="8" ry="14" transform="rotate(-30 88 170)" />
    <ellipse cx="82" cy="195" rx="8" ry="14" transform="rotate(-25 82 195)" />
    <ellipse cx="80" cy="220" rx="8" ry="14" transform="rotate(-18 80 220)" />
    <ellipse cx="80" cy="245" rx="8" ry="14" transform="rotate(-10 80 245)" />
    <ellipse cx="82" cy="270" rx="8" ry="14" transform="rotate(-2 82 270)" />
    <ellipse cx="86" cy="295" rx="8" ry="14" transform="rotate(8 86 295)" />
    <ellipse cx="94" cy="320" rx="8" ry="14" transform="rotate(18 94 320)" />
    <ellipse cx="106" cy="342" rx="8" ry="14" transform="rotate(30 106 342)" />
    <ellipse cx="122" cy="360" rx="8" ry="14" transform="rotate(45 122 360)" />
    <ellipse cx="145" cy="375" rx="8" ry="14" transform="rotate(60 145 375)" />
  </g>

  <!-- Untaian Kapas (Kanan - Putih & Hijau) -->
  <g>
    <!-- Bunga 1 -->
    <circle cx="312" cy="170" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M305,176 Q312,185 319,176" fill="#2E7D32" />
    <!-- Bunga 2 -->
    <circle cx="318" cy="205" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M311,211 Q318,220 325,211" fill="#2E7D32" />
    <!-- Bunga 3 -->
    <circle cx="320" cy="240" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M313,246 Q320,255 327,246" fill="#2E7D32" />
    <!-- Bunga 4 -->
    <circle cx="318" cy="275" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M311,281 Q318,290 325,281" fill="#2E7D32" />
    <!-- Bunga 5 -->
    <circle cx="312" cy="310" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M305,316 Q312,325 319,316" fill="#2E7D32" />
    <!-- Bunga 6 -->
    <circle cx="298" cy="340" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M291,346 Q298,355 305,346" fill="#2E7D32" />
    <!-- Bunga 7 -->
    <circle cx="278" cy="365" r="10" fill="#FFFFFF" stroke="#388E3C" stroke-width="2" />
    <path d="M271,371 Q278,380 285,371" fill="#2E7D32" />
  </g>

  <!-- Pita Kuning Emas di Bawah -->
  <path d="M60,400 L110,388 L140,410 L200,395 L260,410 L290,388 L340,400 L325,432 L285,420 L200,442 L115,420 L75,432 Z" fill="#FFF9C4" stroke="#F57F17" stroke-width="2.5" />
  <path d="M100,395 Q200,430 300,395 L295,428 Q200,460 105,428 Z" fill="#FFFFFF" stroke="#D84315" stroke-width="2" />

  <!-- Tulisan Sesanti: JER BASUKI MAWA BEYA -->
  <text x="200" y="420" font-family="'Times New Roman', Times, serif" font-weight="900" font-size="16" fill="#B71C1C" text-anchor="middle" letter-spacing="2">JER BASUKI MAWA BEYA</text>
  <text x="200" y="440" font-family="'Times New Roman', Times, serif" font-weight="bold" font-size="10" fill="#0D47A1" text-anchor="middle" letter-spacing="1">JAWA TIMUR</text>
</svg>
`;

// 2. SVG LOGO RESMI SMKN 1 TEGALSARI
const svgSmk = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <defs>
    <!-- Gradients -->
    <linearGradient id="smkBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="50%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
  </defs>

  <!-- Outer Shield Segilima -->
  <polygon points="200,15 375,70 345,380 200,465 55,380 25,70" fill="url(#goldGrad)" stroke="#1E293B" stroke-width="6" />

  <!-- Blue Pentagon Body -->
  <polygon points="200,30 358,80 332,368 200,448 68,368 42,80" fill="url(#smkBlueGrad)" stroke="#FFFFFF" stroke-width="4" />

  <!-- Lingkaran Emblem Tengah -->
  <circle cx="200" cy="225" r="145" fill="#0284C7" stroke="url(#goldGrad)" stroke-width="6" />
  <circle cx="200" cy="225" r="132" fill="#0F172A" stroke="#FFFFFF" stroke-width="2" />

  <!-- Teks Melingkar Atas: SMK NEGERI 1 TEGALSARI -->
  <path id="textArcTop" d="M 90,225 A 110,110 0 1,1 310,225" fill="none" />
  <text font-family="'Arial Black', Arial, sans-serif" font-size="16" font-weight="900" fill="#FDE047" letter-spacing="2">
    <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">
      SMK NEGERI 1 TEGALSARI
    </textPath>
  </text>

  <!-- Teks Melingkar Bawah: BANYUWANGI -->
  <path id="textArcBottom" d="M 310,235 A 110,110 0 0,1 90,235" fill="none" />
  <text font-family="'Arial Black', Arial, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">
      • BANYUWANGI •
    </textPath>
  </text>

  <!-- Roda Gigi Teknik / Gear Vokasi (8 Gigi) -->
  <g transform="translate(200, 225)">
    <!-- 8 Gigi Roda -->
    <circle cx="0" cy="0" r="54" fill="#334155" stroke="#94A3B8" stroke-width="2" />
    <rect x="-10" y="-72" width="20" height="24" rx="3" fill="#64748B" />
    <rect x="-10" y="48" width="20" height="24" rx="3" fill="#64748B" />
    <rect x="-72" y="-10" width="24" height="20" rx="3" fill="#64748B" />
    <rect x="48" y="-10" width="24" height="20" rx="3" fill="#64748B" />

    <g transform="rotate(45)">
      <rect x="-10" y="-72" width="20" height="24" rx="3" fill="#64748B" />
      <rect x="-10" y="48" width="20" height="24" rx="3" fill="#64748B" />
      <rect x="-72" y="-10" width="24" height="20" rx="3" fill="#64748B" />
      <rect x="48" y="-10" width="24" height="20" rx="3" fill="#64748B" />
    </g>

    <circle cx="0" cy="0" r="44" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="3" />
  </g>

  <!-- Sayap Kiri dan Kanan (Kuning Emas) -->
  <g fill="url(#goldGrad)" stroke="#B45309" stroke-width="1.5">
    <!-- Sayap Kiri -->
    <path d="M150,225 Q115,200 95,215 Q125,230 145,245 Z" />
    <path d="M152,240 Q110,225 100,240 Q130,250 148,258 Z" />
    <path d="M155,255 Q120,248 112,262 Q135,268 152,270 Z" />

    <!-- Sayap Kanan -->
    <path d="M250,225 Q285,200 305,215 Q275,230 255,245 Z" />
    <path d="M248,240 Q290,225 300,240 Q270,250 252,258 Z" />
    <path d="M245,255 Q280,248 288,262 Q265,268 248,270 Z" />
  </g>

  <!-- Buku Terbuka (Ilmu Pengetahuan) -->
  <g stroke="#1E293B" stroke-width="1.5">
    <path d="M200,255 Q175,245 150,250 L150,278 Q175,272 200,282 Z" fill="#FFFFFF" />
    <path d="M200,255 Q225,245 250,250 L250,278 Q225,272 200,282 Z" fill="#F8FAFC" />
    <line x1="200" y1="255" x2="200" y2="282" stroke="#475569" stroke-width="2.5" />
  </g>

  <!-- Obor Api Berkobar (Semangat Belajar) -->
  <!-- Tangkai Obor -->
  <polygon points="196,252 204,252 202,225 198,225" fill="#F59E0B" stroke="#B45309" stroke-width="1" />
  <!-- Mangkuk Obor -->
  <path d="M192,225 L208,225 L204,235 L196,235 Z" fill="#D97706" />
  <!-- Api Obor -->
  <path d="M200,175 Q212,195 208,210 Q216,215 206,225 Q194,225 192,212 Q188,198 200,175 Z" fill="url(#fireGrad)" stroke="#B91C1C" stroke-width="1" />
  <ellipse cx="200" cy="212" rx="4" ry="8" fill="#FEF08A" />

  <!-- Bintang Emas di Atas -->
  <polygon points="200,55 206,72 224,72 210,83 215,100 200,89 185,100 190,83 176,72 194,72" fill="url(#goldGrad)" stroke="#92400E" stroke-width="1.5" />

  <!-- Pita Bawah: BISA - HEBAT -->
  <path d="M110,405 L140,395 L200,410 L260,395 L290,405 L280,432 L200,442 L120,432 Z" fill="url(#goldGrad)" stroke="#1E293B" stroke-width="2" />
  <text x="200" y="426" font-family="'Arial Black', Arial, sans-serif" font-size="13" font-weight="900" fill="#1E3A8A" text-anchor="middle" letter-spacing="2">SMK BISA - HEBAT</text>
</svg>
`;

async function run() {
  console.log('Rendering logos to crisp PNG...');
  
  // Render Jatim to PNG buffer (240x288 px)
  const pngJatimBuffer = await sharp(Buffer.from(svgJatim))
    .resize(240, 288, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // Render SMKN 1 Tegalsari to PNG buffer (240x288 px)
  const pngSmkBuffer = await sharp(Buffer.from(svgSmk))
    .resize(240, 288, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const base64Jatim = 'data:image/png;base64,' + pngJatimBuffer.toString('base64');
  const base64Smk = 'data:image/png;base64,' + pngSmkBuffer.toString('base64');

  const fileContent = `/**
 * Official School and East Java Province Logo Assets
 * Pre-rendered as high-resolution PNG Base64 Data URIs for instant, reliable PDF generation & printing.
 */

import { SchoolSettings } from '../types/index.ts';

// Logo Provinsi Jawa Timur (Sebelah Kiri Kop Surat)
export const LOGO_JAWA_TIMUR_PNG = "${base64Jatim}";

// Logo Resmi SMKN 1 Tegalsari (Sebelah Kanan Kop Surat)
export const LOGO_SMKN1_TEGALSARI_PNG = "${base64Smk}";

/**
 * Returns the left logo (always East Java Provincial Government emblem)
 */
export function getLogoJawaTimur(): string {
  return LOGO_JAWA_TIMUR_PNG;
}

/**
 * Returns the right logo (School logo).
 * Uses custom uploaded logo from settings if available; otherwise uses official SMKN 1 Tegalsari emblem.
 */
export function getLogoSekolah(settings?: SchoolSettings | null): string {
  if (settings?.logoUrl && settings.logoUrl.trim().length > 10) {
    return settings.logoUrl;
  }
  return LOGO_SMKN1_TEGALSARI_PNG;
}
`;

  const outputPath = path.resolve(__dirname, '..', 'src', 'utils', 'logos.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log('Successfully written to', outputPath);
}

run().catch(console.error);

# Design System: Personal SFA App (Sales Force Automation & Hospitality Pipeline)
**Project Title:** Personal SFA (Sales Force Automation)
**Platform:** Mobile First (iOS / Android 375×812px) & Responsive Web (1280×800px)
**Reference Document:** Google Stitch AI UI Design Specification

---

## 1. Visual Theme & Atmosphere

* **Atmosphere:** **"Ultra-Clean Executive Hospitality"** — A refined, confident, and high-density interface blending the discretion of luxury night-work hospitality (*Ginza / Roppongi concierge tier*) with the precision of high-stakes enterprise sales engineering.
* **Density:** **Balanced High-Information Density** — Mobile viewport optimized with micro-badges, pill-shaped action chips, and nested progress tracks, eliminating unnecessary whitespace while maintaining impeccable visual hierarchy.
* **Mood:** Sophisticated, dark-slate anchored, premium dark-mode accent cards contrasting against crisp snow-white content surfaces.

---

## 2. Color Palette & Functional Roles

| Semantic Color Name | Hex Code | Functional UI Role |
| :--- | :--- | :--- |
| **Midnight Obsidian Slate** | `#0f172a` (Slate 900) | Primary contrast anchor, Forecast Card background, hero CTAs, bottom floating action buttons. |
| **Deep Ink Surface** | `#020617` (Slate 950) | High-contrast loading canvas and root splash. |
| **Electric Cyan Sky** | `#0284c7` (Brand 500) | Primary interactive actions, active navigation icons, progress bars, active tabs. |
| **Glacier Ice Tint** | `#f0f7ff` (Brand 50) | Hover backgrounds, selected stage pills, active filter chips. |
| **Neon Cyan Glow** | `#38bdf8` (Brand 400) | Pacing badges, secondary progress indicators, glowing pipeline figures. |
| **Luxury Rose Velvet** | `#ec4899` (VIP Primary) | VIP Hospitality badge indicator, birthday reminder notifications, champagne milestones. |
| **Soft Rose Silk** | `#fdf2f8` (VIP Light) | VIP status tag background, birthday alert card badges. |
| **Burgundy Crimson** | `#be185d` (VIP Text) | VIP mode text label, urgent action notifications. |
| **Executive Indigo** | `#6366f1` (B2B Primary) | B2B Consulting mode dot, enterprise deal tags. |
| **Soft Lilac Wash** | `#eef2ff` (B2B Light) | B2B status badge container, corporate pipeline tags. |
| **Royal Indigo Text** | `#4338ca` (B2B Text) | B2B mode title and contract stage text. |
| **Prestige Emerald** | `#059669` (Emerald 600) | Confirmed revenue figures, high-win probability pills (>=80%), lifetime LTV metrics. |
| **Amber Caution** | `#d97706` (Amber 600) | Inactive client warnings (>14 days), follow-up nudges. |
| **Neutral Slate Wash** | `#f8fafc` (Slate 50) | App body background, input field backgrounds. |
| **Subtle Hairline Border** | `#e2e8f0` (Slate 200) | Card borders, dividers, list item separators. |

---

## 3. Typography Rules

* **Primary Font Family:** System Sans-Serif (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `Hiragino Sans`, `Yu Gothic UI`).
* **Heading 1 / Metric Big Numbers:** Bold/ExtraBold (`font-weight: 800` or `900`), letter-spacing: `-0.5px`. Used for Forecast amounts (`¥2,213,500`), Page Titles (`20px`), and Quotas.
* **Section Titles / Superheaders:** `11px - 13px`, ExtraBold (`800`), `letter-spacing: 0.5px`, uppercase transformation (`text-transform: uppercase`).
* **Body / Subtitles:** `12px - 14px`, Regular to Medium (`400` / `500`), Slate 500/600 for high legibility on mobile.
* **Micro-Data Badges:** `9px - 11px`, Bold (`700`), enclosed inside pill badges with `padding: 2px 8px`.

---

## 4. Component Stylings

### A. Navigation & Top Header
* **Top Header Bar:** Crisp white background (`#ffffff`), 1px solid bottom border (`#e2e8f0`).
  * **Left:** Persona Badge Pill (`VIP Hospitality` or `B2B Consulting`) with a 7px pulsing colored dot (`#ec4899` or `#6366f1`).
  * **Center/Right:** Quick Language Switcher pill with two options (`🇮🇩 ID` | `🇯🇵 日本語`), subtle active white pill indicator with drop shadow.
  * **Right:** User initials avatar (`32×32px` circle, `#0f172a` background, white text).
* **Bottom Navigation Bar:** Floating dock style, white background, hairline top border, active indicator line (`24×3px`, `#0284c7`), badge counter for alerts (`16×16px`, `#e11d48`).

### B. Cards & Containers
* **Forecast Hero Card:** Midnight Slate (`#0f172a`), 16px radius, subtle radial glow, dual-layer progress bar (Cyan solid for confirmed + Cyan translucent for projected), dual metrics split by 1px translucent divider.
* **Alert Card:** White container, 14px radius, 1px border (`#e2e8f0`), soft shadow (`shadow-sm`), colored status badge at top-left (`🎂 BIRTHDAY TODAY` or `⚠️ INACTIVE > 14 DAYS`), and full-width instant CTA button at bottom.
* **Deal / Kanban Card:** Rounded rectangular card, dual-line header (Contact Name + Target Amount), stage probability badge, and one-tap advance button (`Advance ➔`).

### C. Floating Action Button (FAB)
* **Record Bill CTA:** Anchored at bottom (16px above bottom nav), dark slate capsule (`#0f172a`), 24px elevation shadow, bold white text (`🍾 Record Bill & Sync` / `🍾 売上伝票を記録・同期`).

---

## 5. Depth, Geometry & Elevation

* **Corner Radii:**
  * Small Badges: `6px` (`rounded-sm`)
  * Buttons & Cards: `12px - 14px` (`rounded-lg`)
  * Modals: `24px` top corners (`rounded-t-2xl`)
  * Pills / Segmented Controls: `9999px` (`rounded-full`)
* **Shadow Hierarchy:**
  * Level 0 (Flat): Subtle hairline border `1px solid #e2e8f0`.
  * Level 1 (Cards): Whisper-soft ambient shadow (`shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5`).
  * Level 2 (Floating CTA & Modals): High-contrast elevation shadow (`shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 15`).

---

## 6. Complete Google Stitch Prompts (Screen-by-Screen)

Use the following exact prompts directly in **Google Stitch (https://stitch.withgoogle.com)** to generate or refine the UI screens:

```stitch-prompt
### PROMPT 1: Home / Priority Dashboard Screen (Mobile 375x812)
Mobile app home screen for a luxury Sales Force Automation & VIP Hospitality app named "Personal SFA".

Header:
- Top bar with mode badge "VIP Hospitality" in pink pill (#ec4899), language toggle switch "[🇮🇩 ID | 🇯🇵 日本語]", and circular user avatar "K".
- Large bold screen title "Prioritas Hari Ini" (Today's Priority) with subtitle "Milestone Tamu VIP & Target Penjualan Berbobot".

Main Content:
- Hero Forecast Card: Dark midnight slate background (#0f172a), rounded corners (16px). Shows "PROYEKSI PENDAPATAN BERBOBOT" in small cyan uppercase, huge bold currency "¥2,213,500", and top-right pacing pill "221.4% Pacing" (#38bdf8). Dual-color goal progress bar with confirmed vs projected segments. Metric footer showing Target Quota ¥1,000,000, Confirmed ¥815,000, and Weighted Pipeline ¥632,500.
- Section header "PERINGATAN TINDAKAN (4)" with a "Sinkronisasi Langsung" live sync refresh link.
- Action Alert Card 1 (Birthday): White card with rose badge "🎂 ULANG TAHUN HARI INI", client name "Ayumi S.", LTV "¥1,850,000", suggestion "🍾 Saran: Dom Pérignon Vintage 2012", and pink button "✨ Kirim Ucapan Ulang Tahun".
- Action Alert Card 2 (Inactive): Amber badge "⚠️ TIDAK AKTIF > 14 HARI", client name "Kenzo Murata", LTV "¥2,400,000", last visit "18 hari lalu", button "💬 Hubungi Cepat".
- Floating CTA button at bottom: Sleek dark obsidian pill with glowing shadow "🍾 Catat Tagihan & Sinkron".
- Bottom Navigation Bar with 5 icons: Beranda (active), Peluang, Kontak, Pertumbuhan, Pengaturan.
```

```stitch-prompt
### PROMPT 2: Deals & Retention Pipeline Screen (Mobile 375x812)
Pipeline & Opportunity Funnel screen for personal SFA app with Japanese hospitality and corporate consulting workflows.

Header:
- Top bar with mode toggle and language switcher. Title "Peluang & Pipeline" with subtitle "Tahapan Retensi & Konversi Kunjungan Tamu".

Summary Bar:
- Clean 2-column stats bar: "TOTAL PIPELINE: ¥710,000" and "PROYEKSI BERBOBOT: ¥412,500".

Stage Horizontal Selector:
- Scrollable stage chips with win probabilities:
  1. "Kunjungan Pertama / Inquiry" (20% prob badge) - 3 deals • ¥150,000
  2. "Second Visit Hook" (45% prob badge) - 2 deals • ¥210,000 (Active state with brand blue tint)
  3. "Pelanggan Tetap" (75% prob badge) - 4 deals • ¥350,000
  4. "VIP Champion" (90% prob badge) - 1 deal • ¥500,000

Deals Card List:
- Individual patron cards with client name, company/booth preference, deal expected amount "¥120,000", weighted estimate "W: ¥54,000", last contacted date, and a dark "Lanjutkan ➔" (Advance Stage) button.
```

```stitch-prompt
### PROMPT 3: Client Directory & LTV Screen (Mobile 375x812)
High-touch Client Directory and Lifetime Value (LTV) ranking screen.

Components:
- Search input bar with magnifying glass icon: "Cari nama, panggilan, atau nomor telepon...".
- Sort filter pills: "Urutkan: [Total Belanja (LTV)] [Terbaru] [Nama]" with LTV highlighted in brand blue.
- Patron List Cards:
  - Ranked badge "#1", "#2", "#3".
  - Client name with birthday cake icon if birthday is upcoming.
  - Subtitle phone or nickname.
  - Tag pill "🍾 Dom Pérignon / Yamazaki 18".
  - Right-aligned green LTV currency "¥3,850,000", label "Total Belanja", and current stage badge "VIP Champion".
```

```stitch-prompt
### PROMPT 4: Growth & Zero-Touch Social Attribution Screen (Mobile 375x812)
Marketing attribution and message pitch conversion screen.

Components:
- Hero Banner: Dark navy card (#0f172a) with "PENJUALAN TERATRIBUSI KAMPANYE", large metric "¥1,420,000", and button "⚡ Sinkronkan Postingan". Explanatory caption: "Otomatis dikorelasikan dari postingan Instagram dan X dalam 48 jam sebelum reservasi dibuat."
- Section 1: "Postingan Media Sosial Tersinkron (3)" showing recent Instagram/X posts, impression counts (👀 14,200), likes (❤️ 890), and attributed sales amount (+¥450,000).
- Section 2: "Peringkat Konversi (CVR) Pesan" showing pitch template cards with high CVR badge (e.g. "42.8% CVR"), usage stats, sample message preview, and button "📋 Salin Teks Pesan".
```

```stitch-prompt
### PROMPT 5: Settings & Dual Language System Screen (Mobile 375x812)
Settings and System Configuration screen for Personal SFA.

Components:
- User Profile Card: Circular avatar "K", user name "Kenji Takahashi", email "user@example.com", and monthly sales quota pill "Target Kuota Bulanan: ¥1,000,000".
- Language Selection Card (Section "Pilihan Bahasa Aplikasi"):
  - Option 1: "🇮🇩 Bahasa Indonesia" with radio button (active), description "Gunakan Bahasa Indonesia pada seluruh menu, analitik, dan pipeline."
  - Option 2: "🇯🇵 日本語 (Jepang)" with radio button, description "すべての画面・数値・メニューを日本語で表示します。"
- Operating Persona Mode Card:
  - "🍾 Mode Hospitality VIP" (High-touch guest relations, tab/tsuke balances, table preferences).
  - "💼 Mode Konsultasi B2B" (Milestone pipelines, project scopes, corporate invoices).
- API Endpoint Configuration: Input field showing "http://127.0.0.1:8000/api/v1" with "Simpan" button.
- System Integrations: Meta Instagram Graph API status (Connected), Accounting Outbound Webhook status (Active).
- Danger Zone: Red-bordered button "Keluar dari Akun SFA".
```

```stitch-prompt
### PROMPT 6: Record Sales Modal (Bottom Sheet Modal)
Bottom sheet modal for recording bills and tab settlements.

Header:
- Title "Catat Penjualan & Tagihan", subtitle "Akuntansi Langsung & Sinkronisasi Sosial", close "✕" button.

Body Fields:
- "PILIH KLIEN / TAMU" horizontal scrolling avatar chips.
- "JUMLAH PENJUALAN (JPY)" large numeric input with currency prefix "¥" and quick increment buttons: [+¥50k] [+¥100k] [+¥250k] [+¥500k].
- "METODE PEMBAYARAN": Three selectable buttons:
  - "💳 Kartu Kredit"
  - "💵 Tunai"
  - "📝 Piutang / Bon (ツケ)"
- "DESKRIPSI / RINCIAN PESANAN": Input field "cth. Vintage Dom Pérignon 2012, Reservasi Sofa VIP".
- Zero-Touch Attribution banner in light blue box explaining 48h Instagram correlation.
- Sticky Bottom CTA: High-contrast blue button "Konfirmasi & Simpan Transaksi".
```

---

## 7. Mandatory Bilingual Specification (ID & JA)

In compliance with the **Peraturan Paten & Wajib (Ironclad Bilingual Rule)**:
1. **Bahasa Indonesia (`id`)**: When active, all UI text on every screen must be 100% Indonesian without English residue.
2. **Bahasa Jepang (`ja`)**: When active, all UI text must switch 100% to natural Japanese (*VIP接客, 加重売上予測, 目標ノルマ, 確定売上, 顧客リスト, 成長・SNS, 設定*).
3. The language switcher in Google Stitch designs must always be positioned conspicuously in the top navigation header for 1-tap switching.

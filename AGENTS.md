# Personal SFA Application Rules & Architectural Standards

## 🚨 PERATURAN PATEN & WAJIB BILINGUAL (MANDATORY BILINGUAL RULE)

Proyek ini memiliki **peraturan paten dan wajib** mengenai multi-bahasa:

1. **Dua Bahasa Resmi**:
   - **Bahasa Indonesia (`id`)**
   - **Bahasa Jepang (`ja`)**

2. **Aturan 100% Konsistensi Penuh**:
   - Ketika user memilih **Bahasa Indonesia**, SELURUH antarmuka (UI, header, kartu, tab navigasi, metrik, tombol, modal form, placeholder, error notification, dan status) **100% WAJIB berbahasa Indonesia**.
   - Ketika user memilih **Bahasa Jepang**, SELURUH antarmuka **100% WAJIB berbahasa Jepang**.
   - **DILARANG KERAS** menggunakan string teks hardcoded pada komponen frontend.

3. **Kepatuhan Perubahan Masa Depan**:
   - Setiap ada penambahan fitur baru, perbaikan bug, penyesuaian teks, atau pembuatan screen/komponen baru:
     - Daftarkan key dalam interface `TranslationDictionary` di `frontend/src/i18n/types.ts`.
     - Isi terjemahan lengkap di `frontend/src/i18n/id.ts`.
     - Isi terjemahan lengkap di `frontend/src/i18n/ja.ts`.
     - Konsumsi lewat `useLanguage()`: `const { t, language, setLanguage, formatCurrency, formatDate } = useLanguage();`.

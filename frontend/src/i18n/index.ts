/**
 * =========================================================================
 * MANDATORY & IRONCLAD BILINGUAL I18N SYSTEM (PERATURAN PATEN & WAJIB)
 * =========================================================================
 * RULE:
 * 1. When Indonesian ('id') is selected: 100% of all UI strings, labels,
 *    messages, placeholders, errors, and modal contents MUST be in Indonesian.
 * 2. When Japanese ('ja') is selected: 100% of all UI strings, labels,
 *    messages, placeholders, errors, and modal contents MUST be in Japanese.
 * 3. NO HARDCODED USER-FACING STRINGS ARE ALLOWED in any component or screen.
 * 4. ALL FUTURE FEATURES, SCREENS, OR MODIFICATIONS MUST STRICTLY COMPLY
 *    WITH THIS BILINGUAL SYSTEM by adding corresponding keys in both id.ts and ja.ts.
 * =========================================================================
 */

export * from './types';
export * from './id';
export * from './ja';
export * from './LanguageContext';

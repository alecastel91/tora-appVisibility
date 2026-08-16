#!/usr/bin/env node
/**
 * Translation lint. See TRANSLATION.md for the standard this enforces.
 *
 *   node scripts/check-translations.js
 *
 * Catches the four ways translations have actually broken here:
 *   1. key drift between locales (a missing key silently shows English)
 *   2. {{var}} drift (a user sees a literal "{{n}}")
 *   3. banned terminology (ヴェニュー, palavra-passe, tu-forms in pt-BR…)
 *   4. brand terms that got translated (Tour Kickstart, TORA)
 *
 * Exits non-zero when anything fails, so it can gate a commit or CI.
 */
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const LOCALES = ['en', 'it', 'fr', 'es', 'pt', 'zh', 'ja', 'ko'];
const DIR = path.join(HERE, '..', 'src', 'translations');

// Terms that must never appear, per locale, with what to use instead.
const BANNED = {
  ja: [
    [/ヴェニュー/, 'ベニュー (the reviewed term for the VENUE role)'],
  ],
  pt: [
    [/\bpalavra-passe\b/i, 'senha'],
    [/\butilizador(es)?\b/i, 'usuário(s)'],
    [/\bgerir\b/i, 'gerenciar'],
    [/\bficheiro(s)?\b/i, 'arquivo(s)'],
    [/\bpartilhar\b/i, 'compartilhar'],
    [/\beliminar\b/i, 'excluir'],
    [/\bcontacto(s)?\b/i, 'contato(s)'],
    [/\bteu(s)?\b|\btua(s)?\b/i, 'seu/sua — pt-BR uses você'],
    [/\bpodes\b|\bqueres\b|\btens\b/i, 'pode/quer/tem — pt-BR uses você'],
    [/(^|[^A-Za-zÀ-ÿ])és([^A-Za-zÀ-ÿ]|$)/i, 'é — pt-BR uses você'],
  ],
};

// Must survive untranslated in every locale that mentions them.
const BRAND = ['TORA', 'Tour Kickstart'];

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v]]
  );

// Arrays (the guide chapters) hold objects of strings — pull those out too.
const strings = (pairs) =>
  pairs.flatMap(([k, v]) => {
    if (typeof v === 'string') return [[k, v]];
    if (Array.isArray(v)) {
      return v.flatMap((item, i) =>
        item && typeof item === 'object'
          ? Object.entries(item).flatMap(([ik, iv]) =>
              typeof iv === 'string' ? [[`${k}[${i}].${ik}`, iv]]
              : Array.isArray(iv) ? iv.flatMap((sub, j) =>
                  Object.entries(sub || {}).filter(([, sv]) => typeof sv === 'string')
                    .map(([sk, sv]) => [`${k}[${i}].${ik}[${j}].${sk}`, sv]))
              : [])
          : []
      );
    }
    return [];
  });

const vars = (s) => (s.match(/\{\{\w+\}\}/g) || []).sort().join(',');

(async () => {
  const loaded = {};
  for (const l of LOCALES) {
    const mod = await import(pathToFileURL(path.join(DIR, `${l}.js`)).href);
    loaded[l] = mod.default || Object.values(mod)[0];
  }

  const problems = [];
  const baseKeys = new Set(flatten(loaded.en).map(([k]) => k));
  const baseStrings = new Map(strings(flatten(loaded.en)));

  for (const l of LOCALES) {
    const pairs = flatten(loaded[l]);
    const keys = new Set(pairs.map(([k]) => k));

    for (const k of baseKeys) if (!keys.has(k)) problems.push(`${l}: MISSING key ${k}`);
    for (const k of keys) if (!baseKeys.has(k)) problems.push(`${l}: EXTRA key ${k}`);

    for (const [k, v] of strings(pairs)) {
      const en = baseStrings.get(k);
      if (en && vars(en) !== vars(v)) {
        problems.push(`${l}: {{var}} mismatch at ${k} — en[${vars(en)}] vs ${l}[${vars(v)}]`);
      }
      for (const [re, fix] of BANNED[l] || []) {
        if (re.test(v)) problems.push(`${l}: banned term at ${k} → use ${fix}\n      "${v.slice(0, 90)}"`);
      }
      for (const b of BRAND) {
        // if English used the brand term here, the translation must keep it
        if (en && en.includes(b) && !v.includes(b)) {
          problems.push(`${l}: brand term "${b}" lost at ${k}`);
        }
      }
    }
  }

  const total = flatten(loaded.en).length;
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s) across ${LOCALES.length} locales (${total} keys):\n`);
    problems.slice(0, 40).forEach((p) => console.error('  •', p));
    if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
    console.error('\nSee TRANSLATION.md for the standard.\n');
    process.exit(1);
  }
  console.log(`✓ ${LOCALES.length} locales, ${total} keys — parity, {{vars}}, terminology and brand terms all clean.`);
})().catch((e) => { console.error('check-translations failed:', e.message); process.exit(1); });

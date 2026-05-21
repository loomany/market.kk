import fs from "node:fs";
import path from "node:path";
import {
  getStudioCopy,
  studioCopy,
  studioCopyLeafKeys,
  validateStudioCopyParity,
} from "../../lib/studio/i18n";

const CYRILLIC = /[А-Яа-яЁё]/;
const TODO_RE = /\bTODO\b/i;

const COPY_ALLOWLIST = new Set([
  path.join("lib", "studio", "i18n", "studioCopyRu.ts"),
  path.join("lib", "studio", "i18n", "studioCopyKk.ts"),
  path.join("lib", "studio", "i18n", "studioCopyPass2.ts"),
]);

/** Legacy RU label registry for lib/ai; Studio UI uses studioCopy via studioOptionLists */
const COMPONENT_ALLOWLIST = new Set(["types.ts"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "i18n") continue;
      walk(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function leafStringValues(obj: unknown, out: string[] = []): string[] {
  if (typeof obj === "string") {
    out.push(obj);
    return out;
  }
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const v of Object.values(obj as Record<string, unknown>)) {
      leafStringValues(v, out);
    }
  }
  return out;
}

function isAllowedCyrillicLine(line: string): boolean {
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return true;
  if (/import\s/.test(line)) return true;
  if (/console\./.test(line)) return true;
  if (/test\(|describe\(|it\(/.test(line)) return true;
  if (/\.test\(tryOnProgress\)/.test(line)) return true;
  if (/sourceModel|sourcePresentation|SummaryRu|PoseRu|garmentLabelRu/.test(line)) {
    return true;
  }
  if (/buildModelBaseSettingsSummaryRu|productPoseLabelForUi/.test(line)) return true;
  if (/MODEL_CUSTOM_SELECT_OPTION/.test(line)) return true;
  if (/hintForAspectRatioOption/.test(line)) return true;
  if (/не включён|not configured|PAID_AI_RUNS_DISABLED/i.test(line)) return true;
  if (/toLocaleString\s*\(\s*["']ru-RU/i.test(line)) return true;
  return false;
}

function main() {
  const errors: string[] = [];

  errors.push(...validateStudioCopyParity());

  for (const locale of ["ru", "en", "kk"] as const) {
    const values = leafStringValues(studioCopy[locale]);
    for (const value of values) {
      if (!value.trim()) errors.push(`${locale}: empty string in copy`);
      if (TODO_RE.test(value)) errors.push(`${locale}: TODO in copy: ${value}`);
    }
  }

  const enValues = leafStringValues(studioCopy.en);
  const enCyrillic = enValues.filter((v) => CYRILLIC.test(v));
  if (enCyrillic.length > 3) {
    errors.push(
      `en copy has ${enCyrillic.length} Cyrillic UI strings (expected ≤3 for RU/KK badges)`
    );
  }

  const studioComponents = walk(path.join(process.cwd(), "components", "studio"));

  for (const file of studioComponents) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    if (COMPONENT_ALLOWLIST.has(path.basename(file))) continue;
    if (rel === "components/studio/types.ts") continue;

    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!CYRILLIC.test(line)) continue;
      if (isAllowedCyrillicLine(line)) continue;
      errors.push(
        `${rel}:${i + 1}: hardcoded Cyrillic — ${line.trim().slice(0, 80)}`
      );
    }
  }

  const keyCount = studioCopyLeafKeys(
    studioCopy.ru as unknown as Record<string, unknown>
  ).length;
  console.log(`Studio copy keys: ${keyCount}`);
  console.log(`getStudioCopy('en').hero.title: ${getStudioCopy("en").hero.title}`);

  if (errors.length) {
    console.error("check:studio:i18n FAILED");
    for (const e of errors.slice(0, 50)) console.error(`  - ${e}`);
    if (errors.length > 50) console.error(`  … and ${errors.length - 50} more`);
    process.exit(1);
  }

  console.log("check:studio:i18n PASS");
}

main();

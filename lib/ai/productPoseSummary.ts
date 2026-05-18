/** Короткая подпись позы для SaaS-UI (итоговый промт, карточка «поза с товара»). */
export function buildProductPoseSummaryRu(description: string): string {
  const text = description.trim().replace(/\s+/g, " ");
  if (!text) return "поза с фото товара";
  if (text.length <= 52 && !/^модель\s/i.test(text)) {
    return text.replace(/[.!?…]+$/, "");
  }

  const parts: string[] = [];

  if (/сид/i.test(text)) parts.push("сидя");
  else if (/стоя|стоит|сто\b/i.test(text)) parts.push("стоя");
  else if (/леж|лёжа/i.test(text)) parts.push("лёжа");

  if (/крупн|крупный план/i.test(text)) {
    if (/лиц.*б[её]дер|б[её]дер.*лиц/i.test(text)) {
      parts.push("крупный план по бёдра");
    } else if (/пояс/i.test(text)) {
      parts.push("крупный план по пояс");
    } else {
      parts.push("крупный план");
    }
  } else if (/полный рост|во весь рост|head-to-toe/i.test(text)) {
    parts.push("в полный рост");
  } else if (/по пояс|пояс/i.test(text)) {
    parts.push("по пояс");
  } else if (/по колен/i.test(text)) {
    parts.push("по колено");
  }

  if (/полуоборот|три четверти|3\/4/i.test(text)) {
    parts.push("полуоборот");
  } else if (/фронт|сперед|к камере/i.test(text) && parts.length > 0) {
    parts.push("спереди");
  }

  if (parts.length > 0) {
    return parts.join(", ");
  }

  const clause = (text.split(/[.!?]/)[0] ?? text).trim();
  if (clause.length <= 52) return clause;
  return `${clause.slice(0, 49)}…`;
}

export function productPoseLabelForUi(angle: {
  label: string;
  descriptionRu?: string;
}): string {
  const full = angle.descriptionRu?.trim() || angle.label.trim();
  const summary = angle.label.trim();
  if (angle.descriptionRu?.trim()) {
    return summary || buildProductPoseSummaryRu(full);
  }
  if (full.length > 52 || /^модель\s/i.test(full)) {
    return buildProductPoseSummaryRu(full);
  }
  return summary || full;
}

export function productPoseDescriptionForGeneration(angle: {
  label: string;
  descriptionRu?: string;
}): string | undefined {
  const full = angle.descriptionRu?.trim() || angle.label.trim();
  return full || undefined;
}

/**
 * UI copy for lingerie crop when server product-zone framing is active.
 *
 * Run: `npm run test:lingerie-crop-ui`
 */
import assert from "node:assert/strict";

import {
  getLingerieCropDescription,
  getLingerieCropSelectLabel,
  LINGERIE_CROP_CATALOG_HINT,
  LINGERIE_CROP_PRODUCT_ZONE_HINT,
  SOURCE_PRODUCT_ZONE_CROP_BADGE,
} from "../lib/studio/lingerieCropUiCopy.ts";

function testInactiveUsesCatalogHint() {
  const hint = getLingerieCropDescription({
    crop: "upper-thigh",
    cropCustom: "",
    sourceProductZoneFramingActive: false,
  });
  assert.equal(hint, LINGERIE_CROP_CATALOG_HINT);
  console.log("[ok] inactive source framing keeps catalog hint");
}

function testActiveUsesProductZoneHint() {
  const hint = getLingerieCropDescription({
    crop: "upper-thigh",
    cropCustom: "",
    sourceProductZoneFramingActive: true,
  });
  assert.equal(hint, LINGERIE_CROP_PRODUCT_ZONE_HINT);
  assert.match(hint, /Низ кадра как на товарном фото/i);
  assert.match(hint, /без ног/i);
  assert.match(hint, /голова и руки/i);
  assert.match(hint, /9:16/i);
  console.log("[ok] active source framing shows product-zone hint");
}

function testBadgeCopy() {
  assert.match(
    SOURCE_PRODUCT_ZONE_CROP_BADGE,
    /Кадр будет адаптирован под товарное фото/i
  );
  console.log("[ok] badge copy present");
}

function testActiveSelectLabelReplacesUpperThigh() {
  const label = getLingerieCropSelectLabel({
    crop: "upper-thigh",
    defaultLabel: "До верхней части бедра",
    sourceProductZoneFramingActive: true,
  });
  assert.equal(label, SOURCE_PRODUCT_ZONE_CROP_BADGE);
  assert.match(label, /Кадр будет адаптирован под товарное фото/i);
  console.log("[ok] active framing replaces upper-thigh select label");
}

function testInactiveSelectLabelKeepsCatalog() {
  const label = getLingerieCropSelectLabel({
    crop: "upper-thigh",
    defaultLabel: "До верхней части бедра",
    sourceProductZoneFramingActive: false,
  });
  assert.equal(label, "До верхней части бедра");
  console.log("[ok] inactive framing keeps catalog select label");
}

function testActiveOtherPresetsKeepOwnLabels() {
  const upperBody = getLingerieCropSelectLabel({
    crop: "upper-body",
    defaultLabel: "По пояс",
    sourceProductZoneFramingActive: true,
  });
  assert.equal(upperBody, "По пояс");
  console.log("[ok] active framing keeps non-default crop labels");
}

function testActiveIgnoresCropPresetLabelSemantics() {
  const fullBodyHint = getLingerieCropDescription({
    crop: "full-body",
    cropCustom: "",
    sourceProductZoneFramingActive: true,
  });
  assert.equal(fullBodyHint, LINGERIE_CROP_PRODUCT_ZONE_HINT);
  console.log("[ok] active framing overrides hint for any lingerie crop preset");
}

function main() {
  testInactiveUsesCatalogHint();
  testActiveUsesProductZoneHint();
  testBadgeCopy();
  testActiveSelectLabelReplacesUpperThigh();
  testInactiveSelectLabelKeepsCatalog();
  testActiveOtherPresetsKeepOwnLabels();
  testActiveIgnoresCropPresetLabelSemantics();
  console.log("\nAll lingerie crop UI copy checks passed.");
}

main();

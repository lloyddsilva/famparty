// Reviewed-pack gate: fails unless every content pack has been human-reviewed.
// Run on purpose with a pack flipped to reviewed:false to prove the build breaks.
import { ALL_PACKS } from "../src/lib/packs.js";

const unreviewed = ALL_PACKS.filter((p) => !p.reviewed);
if (unreviewed.length) {
  console.error(`✖ Unreviewed content packs: ${unreviewed.map((p) => p.id).join(", ")}`);
  console.error("  A human must review family-safety and originality, then set reviewed: true in src/lib/packs.js.");
  process.exit(1);
}
console.log(`✓ All ${ALL_PACKS.length} content packs are marked reviewed.`);

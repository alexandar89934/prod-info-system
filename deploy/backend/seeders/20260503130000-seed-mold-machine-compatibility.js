"use strict";

const { randomUUID } = require("crypto");

/**
 * Compatibility logic:
 *
 * Machines are grouped by clamping force and mold space (maxMoldWidth x maxMoldHeight):
 *   Large   (8000–10000 kN, 1000–1100 mm):  JM800 (#2,3,19,20,22), JM1000 (#14,18)
 *   Medium  (3000–5000 kN, 800–1000 mm):    Engel 400 (#8,9), KM500 (#24), Sumitomo 450 (#21)
 *   Small-M (2500–3000 kN, 630–800 mm):     KM300 (#7), Engel 300 (#5,6), KM250 (#12)
 *   Small   (500–1500 kN, 220–500 mm):      KM150 (#26,30), Arburg 420M (#27), Arburg 370C (#28,29), Arburg 220 (#32)
 *
 * Situations covered:
 *   - 1 mold → 1 machine  (7 molds): unique or specialized tools
 *   - 1 mold → 2 machines (8 molds): fits two machines of the same or similar class
 *   - 1 mold → 3 machines (5 molds): standardized part that runs on a whole machine class
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Fetch molds by inventoryNumber
    const [moldRows] = await queryInterface.sequelize.query(
      `SELECT id, "inventoryNumber" FROM "Molds"
       WHERE "inventoryNumber" IN (
         201840, 202032, 202033, 202758,
         206407, 206441, 206772,
         202686, 202905, 202906, 203100, 206187, 206519,
         205485, 205898, 202842,
         206215, 202940, 202939, 202953
       );`
    );
    const moldMap = {};
    moldRows.forEach((r) => { moldMap[r.inventoryNumber] = r.id; });

    // Fetch machines by machineNumber
    const [machineRows] = await queryInterface.sequelize.query(
      `SELECT id, "machineNumber" FROM "Machines"
       WHERE "machineNumber" IN (2, 3, 5, 6, 7, 8, 9, 12, 14, 18, 19, 20, 21, 22, 24, 26, 27, 28, 29, 30, 32);`
    );
    const machineMap = {};
    machineRows.forEach((r) => { machineMap[r.machineNumber] = r.id; });

    const m = moldMap;
    const mc = machineMap;

    // [moldInventoryNumber, machineNumber, cycleTimeSeconds, startupScrapCount, notes]
    const pairs = [
      // ─── LARGE PARTS — JM800 class (8000 kN, 1000×1000 mm tie-bar clearance) ───────────

      // POSODA ZA ZELENJAVO H54 (vegetable bin, large)
      // → 2 machines: both JM800 machines have same daylight and force
      [201840, 2,  45, 5, "Centering ring 200 mm. Cooling 18 s. Check ejector pins before start."],
      [201840, 3,  45, 5, "Centering ring 200 mm. Cooling 18 s. Check ejector pins before start."],

      // POSODA ZA JAJCA H54 (egg tray — deep draw, asymmetric)
      // → 1 machine: only runs on #22 due to specific hot-runner wiring
      [202032, 22, 52, 8, "Hot-runner 4-zone. Do not exceed 230 °C nozzle temp. Dedicated on #22."],

      // POSODA VRAT PREG. H54 (door pocket partition, multi-cavity)
      // → 3 machines: standardized — fits all three available JM800 machines
      [202033, 2,  38, 4, "2-cavity. Cooling 14 s. Both cavities must be balanced before run."],
      [202033, 3,  38, 4, "2-cavity. Cooling 14 s. Both cavities must be balanced before run."],
      [202033, 20, 40, 4, "2-cavity. Cooling 15 s. Slightly longer cycle due to older hydraulics on #20."],

      // PREDAL 2D A6-Z235 (A6 drawer, long part, needs >900 mm tie-bar width)
      // → 2 machines: JM800 #19 and #20
      [202758, 19, 42, 6, "Long part 735 mm. Verify mold parallelism ±0.05 mm before start."],
      [202758, 20, 42, 6, "Long part 735 mm. Verify mold parallelism ±0.05 mm before start."],

      // ─── LARGE HOUSINGS — JM1000 class (10000 kN, 1100×1100 mm) ────────────────────────

      // OHIŠJE ZGORNJE A54 (A54 top housing — large single-cavity)
      // → 2 machines: both JM1000 (#14 and #18) are identical model
      [206407, 14, 58, 7, "Single cavity. 4-zone cooling. Mold temp 35 °C. Demoulding angle critical."],
      [206407, 18, 58, 7, "Single cavity. 4-zone cooling. Mold temp 35 °C. Demoulding angle critical."],

      // OHIŠJE SPODNJE A54 568521 (A54 bottom housing, heavier)
      // → 1 machine: only JM1200 (#15) has enough shot weight for this part
      [206441, 15, 65, 8, "Heavy part ~1.2 kg. JM1200 required for shot weight. Back pressure 80 bar."],

      // OHIŠJE ZG A54 - 2 GNEZDA (A54 top housing 2-cavity variant)
      // → 2 machines: JM1000 pair — same machine class, 2-cavity doubles force requirement
      [206772, 14, 55, 6, "2-cavity — doubled clamping force needed (~6500 kN). Only JM1000 class."],
      [206772, 18, 55, 6, "2-cavity — doubled clamping force needed (~6500 kN). Only JM1000 class."],

      // ─── MEDIUM DOOR POCKETS — Engel 400 + KM500 (4000–5000 kN, 900–1200 mm) ───────────

      // POSODA VRAT H6E 100 (H6E door pocket, standard size)
      // → 2 machines: twin Engel Victory 400 (#8 and #9) are interchangeable
      [202686, 8,  32, 4, "Engel CC300. Cooling 12 s. Check seal ring condition every 500 shots."],
      [202686, 9,  32, 4, "Engel CC300. Cooling 12 s. Check seal ring condition every 500 shots."],

      // POSODA VRAT H6F 95 (H6F tall pocket, 95 mm depth)
      // → 1 machine: only #8 — fitted with extended ejection stroke needed for deep pocket
      [202905, 8,  35, 5, "Deep-draw 95 mm. Extended ejection stroke on #8 only. Cooling 14 s."],

      // POSODA VRAT H6F 40 (H6F shallow pocket 40 mm — lighter clamping needed)
      // → 3 machines: fits both Engel 400 and KM500 — shallow part tolerates wider machine range
      [202906, 8,  28, 3, "Shallow pocket. Cooling 10 s. Can run on KM500 or Engel 400."],
      [202906, 9,  28, 3, "Shallow pocket. Cooling 10 s. Can run on KM500 or Engel 400."],
      [202906, 24, 30, 3, "Slightly longer cycle on KM500 due to hydraulic injection speed."],

      // PREDAL Z183 A6 (A6 drawer Z183 — standard width, single cavity)
      // → 1 machine: KM500 #24 — sized for this mold's 480 mm thickness range
      [203100, 24, 36, 5, "KM500 MC4 control. Injection speed 80 mm/s. Cooling 13 s."],

      // PREDAL A54 Z187 (A54 drawer — medium part)
      // → 2 machines: Engel 400 #9 and KM500 #24
      [206187, 9,  34, 4, "Engel CC300. Holding pressure 600 bar. Cooling 12 s."],
      [206187, 24, 36, 4, "KM500 MC4. Holding pressure 620 bar. Cooling 13 s."],

      // PREDAL C6 Z220 (C6 drawer — heavier, Sumitomo preferred for surface finish)
      // → 1 machine: Sumitomo Demag #21 — NC5 control gives better surface finish for visible part
      [206519, 21, 33, 4, "Visible A-surface. Sumitomo NC5 preferred for injection profile precision. Cooling 12 s."],

      // ─── MEDIUM-SMALL PANELS — Engel 300 + KM300 (3000 kN, 630–1000 mm) ───────────────

      // BLENDA PREDALA A6 Z235 (A6 drawer panel — visible surface, ABS)
      // → 2 machines: twin Engel Victory 300 (#5 and #6) — identical machines
      [205485, 5,  25, 3, "ABS visible surface. Mold temp 60 °C. Injection speed 120 mm/s."],
      [205485, 6,  25, 3, "ABS visible surface. Mold temp 60 °C. Injection speed 120 mm/s."],

      // BLENDA PREDALA A54 Z187 (A54 drawer panel — wider, needs KM300 tie-bar width)
      // → 1 machine: KM300 #7 — wider tie-bar than Engel 300
      [205898, 7,  27, 3, "Wider panel — KM300 needed for 630 mm tie-bar distance. Cooling 10 s."],

      // USMERNIK ZRAKA ZF A6 (air deflector — thin-wall, fast injection)
      // → 3 machines: thin-wall PP part, fast injection, fits all machines in 3000 kN class
      [202842, 5,  20, 5, "Thin-wall 1.5 mm. Fast injection 200 mm/s. Back pressure 30 bar."],
      [202842, 6,  20, 5, "Thin-wall 1.5 mm. Fast injection 200 mm/s. Back pressure 30 bar."],
      [202842, 7,  22, 5, "Slightly slower on KM300 hydraulics. Injection 180 mm/s. Back pressure 30 bar."],

      // ─── SMALL PARTS — Arburg / KM150-250 class (500–1500 kN, 220–500 mm) ─────────────

      // GUMB TERMOSTATA (thermostat button — small, multi-cavity, standard Arburg tool)
      // → 3 machines: standardized small mold, runs on all three Arburg 370 machines
      [206215, 27, 18, 8, "4-cavity. Arburg MULTRONICA. Holding 400 bar. Cycle 18 s incl. sprue removal."],
      [206215, 28, 18, 8, "4-cavity. Arburg MULTRONICA. Same settings as #27."],
      [206215, 29, 18, 8, "4-cavity. Arburg MULTRONICA. Same settings as #27."],

      // LEČA VRAT 6NC (door lens — transparent PS, optical part, slow injection needed)
      // → 1 machine: small Arburg 220 #32 — slowest injection for optical clarity
      [202940, 32, 22, 6, "Transparent PS. Very slow injection 20 mm/s. No sink marks tolerated. Only on #32."],

      // NOKSILEC REED STIKALA BK70 (reed switch holder — small bracket)
      // → 2 machines: KM150-700 (#26) and KM150-900 (#30) — same clamping class
      [202939, 26, 16, 5, "Small bracket PA66. Mold temp 80 °C. Fast cycle. KM150 class fits both."],
      [202939, 30, 16, 5, "Small bracket PA66. Mold temp 80 °C. Fast cycle. KM150 class fits both."],

      // VZVOD (lever — small structural PP part, single cavity)
      // → 1 machine: KM250 #12 — good for structural PP, mid-range shot weight
      [202953, 12, 20, 4, "Structural PP. Shot weight 180 g. KM250 MC3 control. Cooling 8 s."],
    ];

    const records = pairs
      .filter(([inv, mn]) => m[inv] && mc[mn])
      .map(([inv, mn, cycleTime, startupScrap, notes]) => ({
        id: randomUUID(),
        moldId: m[inv],
        machineId: mc[mn],
        cycleTimeSeconds: cycleTime,
        startupScrapCount: startupScrap,
        notes,
        settingParameters: JSON.stringify(null),
        createdAt: now,
        updatedAt: now,
      }));

    if (records.length > 0) {
      await queryInterface.bulkInsert("MoldMachineCompatibility", records);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("MoldMachineCompatibility", null, {});
  },
};
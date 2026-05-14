"use strict";

const { randomUUID } = require("crypto");

/**
 * Compatibility for the trimmed machine/mold set:
 *
 *   Large (8000 kN, JM800): Cheng Hsong JM800-MK6 #20
 *   Medium (3000 kN, Engel CC300): Engel Victory 300 #5
 *   Small (500 kN, Arburg): Arburg 220-75-250 #32
 *
 *   201840 POSODA ZA ZELENJAVO  → #20 only (JM800 required, 200 mm centering ring)
 *   202032 POSODA ZA JAJCA      → #20 only (JM800, 4-zone hot-runner)
 *   202842 USMERNIK ZRAKA ZF A6 → #5 only  (thin-wall, Engel CC300 injection profile)
 *   206215 GUMB TERMOSTATA      → #32 only (4-cavity small mold, Arburg class)
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [moldRows] = await queryInterface.sequelize.query(
      `SELECT id, "inventoryNumber" FROM "Molds"
       WHERE "inventoryNumber" IN (201840, 202032, 202842, 206215);`
    );
    const moldMap = {};
    moldRows.forEach((r) => { moldMap[r.inventoryNumber] = r.id; });

    const [machineRows] = await queryInterface.sequelize.query(
      `SELECT id, "machineNumber" FROM "Machines"
       WHERE "machineNumber" IN (5, 20, 32);`
    );
    const machineMap = {};
    machineRows.forEach((r) => { machineMap[r.machineNumber] = r.id; });

    const m = moldMap;
    const mc = machineMap;

    // [moldInventoryNumber, machineNumber, cycleTimeSeconds, startupScrapCount, normPerShift, notes]
    const pairs = [
      [201840, 20, 45, 5, 600,  "Centering ring 200 mm. Cooling 18 s. Check ejector pins before start."],
      [202032, 20, 52, 8, 500,  "Hot-runner 4-zone. Do not exceed 230 °C nozzle temp."],
      [202842,  5, 20, 5, 1300, "Thin-wall 1.5 mm. Fast injection 200 mm/s. Back pressure 30 bar."],
      [206215, 32, 20, 8, 1400, "4-cavity. Arburg 220-75-250. Holding 400 bar. Cycle 20 s incl. sprue removal."],
    ];

    const records = pairs
      .filter(([inv, mn]) => m[inv] && mc[mn])
      .map(([inv, mn, cycleTime, startupScrap, normPerShift, notes]) => ({
        id: randomUUID(),
        moldId: m[inv],
        machineId: mc[mn],
        cycleTimeSeconds: cycleTime,
        startupScrapCount: startupScrap,
        normPerShift,
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
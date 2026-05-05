"use strict";

const { randomUUID } = require("crypto");

/**
 * BOM lines linking finished goods to raw materials.
 *
 * Confirmed normatives from NORMATIV-NOVEMBAR 20.10.2017.xlsx:
 *   134880, 135781, 132989, 135827, 135833 — exact g/kom values for 666729 + 126828
 *   396420, 449179 — exact g/kom for 19301 from IZRAČUN
 *   449104 — exact g/kom for 355210 from IZRAČUN
 *
 * Inferred (piece weight × 1.029 runner factor, masterbatch = 2% of shot):
 *   449130, 528933, 407982, 576345, 798219, 408278
 *
 * ABS-surface items (408017, 576346, 563088, 563354) omitted — base resin
 * code not confirmed in available source documents.
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [itemRows] = await queryInterface.sequelize.query(
      `SELECT id, "itemCode" FROM "Items"
       WHERE "itemCode" IN (
         '19301', '666729', '126828', '21023', '355210',
         '396420', '449104', '449130', '449179', '528933',
         '134880', '135781', '132989', '135827', '135833',
         '407982', '576345', '798219', '408278'
       );`
    );
    const item = {};
    itemRows.forEach((r) => { item[r.itemCode] = r.id; });

    // [outputItemCode, inputItemCode, quantityPerPiece, unit, notes]
    const lines = [
      // ─── Small PP components — PP NATURAL 19301 ──────────────────────────────
      ["396420", "19301",   7.00,   "g", "NORMATIV: 7.00 g/kom (IZRAČUN col 19301)"],
      ["449179", "19301",   5.00,   "g", "NORMATIV: 5.00 g/kom (IZRAČUN col 19301)"],
      ["449130", "19301",  10.30,   "g", "inferred: piece weight 10 g + ~3% runner"],

      // ─── Transparent lens — PS TRANSPARENT 355210 ────────────────────────────
      ["449104", "355210",  5.67,   "g", "NORMATIV: 5.67 g/kom (IZRAČUN col 355210)"],

      // ─── HIPS egg-tray container — HIPS 21023 ────────────────────────────────
      ["528933", "21023",  28.84,   "g", "inferred: piece weight 28 g + ~3% runner"],

      // ─── PP black H54 fittings — base resin 666729 + CB masterbatch 126828 ──
      ["134880", "666729", 66.89,   "g", "NORMATIV: 66.89 g/kom"],
      ["134880", "126828",  1.37,   "g", "NORMATIV: 1.37 g/kom"],
      ["135781", "666729", 380.73,  "g", "NORMATIV: 380.73 g/kom"],
      ["135781", "126828",  7.77,   "g", "NORMATIV: 7.77 g/kom"],

      // ─── PP black H6x door pockets — base resin 666729 + CB masterbatch 126828
      ["132989", "666729", 334.43,  "g", "NORMATIV: 334.43 g/kom"],
      ["132989", "126828",  6.83,   "g", "NORMATIV: 6.83 g/kom"],
      ["135827", "666729", 272.69,  "g", "NORMATIV: 272.69 g/kom"],
      ["135827", "126828",  5.57,   "g", "NORMATIV: 5.57 g/kom"],
      ["135833", "666729", 226.38,  "g", "NORMATIV: 226.38 g/kom"],
      ["135833", "126828",  4.62,   "g", "NORMATIV: 4.62 g/kom"],

      // ─── Large PP parts — inferred (piece weight × 1.029, CB = 2% of shot) ──
      ["408278", "666729", 615.73,  "g", "inferred: piece weight 598 g + ~3% runner"],
      ["408278", "126828", 12.31,   "g", "inferred: 2% CB masterbatch of 615.73 g shot"],
      ["407982", "666729", 899.45,  "g", "inferred: piece weight 874 g + ~3% runner"],
      ["407982", "126828", 17.99,   "g", "inferred: 2% CB masterbatch of 899.45 g shot"],
      ["576345", "666729", 743.00,  "g", "inferred: piece weight 722 g + ~3% runner"],
      ["576345", "126828", 14.86,   "g", "inferred: 2% CB masterbatch of 743 g shot"],
      ["798219", "666729", 482.56,  "g", "inferred: piece weight 469 g + ~3% runner"],
      ["798219", "126828",  9.65,   "g", "inferred: 2% CB masterbatch of 482.56 g shot"],
    ];

    await queryInterface.bulkInsert(
      "BomLines",
      lines.map(([outputItemCode, inputItemCode, quantityPerPiece, unit, notes]) => ({
        id: randomUUID(),
        outputItemId: item[outputItemCode],
        inputItemId: item[inputItemCode],
        quantityPerPiece,
        unit,
        notes,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  async down(queryInterface) {
    const [itemRows] = await queryInterface.sequelize.query(
      `SELECT id FROM "Items"
       WHERE "itemCode" IN (
         '396420', '449104', '449130', '449179', '528933',
         '134880', '135781', '132989', '135827', '135833',
         '407982', '576345', '798219', '408278'
       );`
    );
    const ids = itemRows.map((r) => r.id);
    if (ids.length) {
      await queryInterface.bulkDelete("BomLines", { outputItemId: ids });
    }
  },
};
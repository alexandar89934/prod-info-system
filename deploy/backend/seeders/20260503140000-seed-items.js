"use strict";

const { randomUUID } = require("crypto");

/**
 * Items sourced from IZRAČUN-SIMIL-03.2025-2.xlsm (BRIZGANJE sheet) and
 * NORMATIV-NOVEMBAR 20.10.2017.xlsx. All 18 finished goods / components are
 * linked to molds that have MoldMachineCompatibility records — toolId is set
 * on every such row.
 *
 * Finished goods grouped by machine class:
 *   Small parts      — Arburg / KM150-250 class (molds 202939, 202940, 202953, 206215)
 *   H54 series       — JM800 class (molds 201840, 202032, 202033)
 *   H6x door pockets — Engel 400 / KM500 (molds 202686, 202905, 202906)
 *   Panels/deflectors — Engel 300 / KM300 (molds 202842, 205485, 205898)
 *   Large drawers    — Engel 400 / KM500 / Sumitomo (molds 202758, 206187, 206519)
 *   Housings         — JM1000 / JM1200 class (molds 206407, 206441)
 *
 * Raw materials (no toolId):
 *   19301  — PP NATURAL (small colourless components)
 *   666729 — PP BAZA NATURAL (base resin for black PP parts)
 *   126828 — MASTERBATCH CRNI 40% (CB masterbatch, ~2% dosage)
 *   21023  — HIPS (egg-tray containers)
 *   355210 — PS TRANSPARENT (optical lens parts)
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [moldRows] = await queryInterface.sequelize.query(
      `SELECT id, "inventoryNumber" FROM "Molds"
       WHERE "inventoryNumber" IN (
         201840, 202032, 202033,
         202686, 202758, 202842, 202905, 202906, 202939, 202940, 202953,
         205485, 205898, 206187, 206215, 206407, 206441, 206519
       );`
    );
    const mold = {};
    moldRows.forEach((r) => { mold[r.inventoryNumber] = r.id; });

    // [itemCode, name, category, unit, pieceWeightG, priceEurPerUnit, approvalLevel, toolInvNr, notes]
    const rows = [
      // ─── Small components — Arburg / KM150-250 ───────────────────────────────
      ["396420", "GUMB TERMOSTATA H M4 070",    "component",    "kom",    7,    0.09,  null,             206215, "PP; 4-cavity; runs on Arburg MULTRONICA"],
      ["449104", "LEČA VRAT 6N",                "component",    "kom",    5.5,  0.14,  "qc_controller",  202940, "Transparent PS; optical surface; very slow injection"],
      ["449179", "NOSILEC REED STIKALA ZF",     "component",    "kom",    5,    0.11,  null,             202939, "PA66; mold temp 80 °C; KM150 class"],
      ["449130", "VZVOD DV 070",                "component",    "kom",    10,   0.18,  null,             202953, "Structural PP; KM250; single-cavity"],

      // ─── H54 refrigerator fittings — JM800 class ─────────────────────────────
      ["528933", "POSODA ZA JAJCA H54 000",     "finished_good","kom",    28,   0.35,  null,             202032, "Hot-runner 4-zone; dedicated on JM800 #22"],
      ["134880", "POSODA VR.PREG.H54 087",      "finished_good","kom",    65,   0.72,  null,             202033, "2-cavity; PP black; balanced cooling required"],
      ["135781", "POSODA ZELENJAVE H54 VIS.087","finished_good","kom",    370,  1.85,  null,             201840, "PP black; centering ring 200 mm; JM800 #2 or #3"],

      // ─── H6x door pockets — Engel Victory 400 / KM500 ───────────────────────
      ["132989", "POSODA VRAT H6E 100 087",     "finished_good","kom",    325,  1.60,  null,             202686, "PP; 2×Engel CC300; check seal ring every 500 shots"],
      ["135827", "POSODA VRAT H6F 95 087",      "finished_good","kom",    265,  1.42,  null,             202905, "Deep-draw 95 mm; extended ejection stroke; only Engel #8"],
      ["135833", "POSODA VRAT H6F 40 087",      "finished_good","kom",    220,  1.15,  null,             202906, "Shallow pocket; runs on Engel #8, #9 or KM500 #24"],

      // ─── Panels and deflectors — Engel Victory 300 / KM300 ──────────────────
      ["408017", "BLENDA PREDALA A6-Z235 031",  "finished_good","kom",    365,  2.10,  "qc_controller",  205485, "ABS visible A-surface; mold temp 60 °C; Engel 300 pair"],
      ["576346", "BLENDA PREDALA A54 Z187 031", "finished_good","kom",    334,  1.95,  "qc_controller",  205898, "ABS visible surface; KM300 #7 for 630 mm tie-bar"],
      ["408278", "USMERNIK ZRAKA A6 ZF 070",    "finished_good","kom",    598,  2.40,  null,             202842, "Thin-wall 1.5 mm PP; fast injection 200 mm/s; Engel 300 or KM300"],

      // ─── Large drawers — Engel 400 / KM500 / Sumitomo ───────────────────────
      ["407982", "PREDAL A6-Z235 070",          "finished_good","kom",    874,  4.20,  null,             202758, "Long part 735 mm; verify parallelism ±0.05 mm; JM800 #19 or #20"],
      ["576345", "PREDAL A54 Z187 070",         "finished_good","kom",    722,  3.60,  null,             206187, "PP; Engel 400 #9 or KM500 #24; holding 600-620 bar"],
      ["798219", "PREDAL C6 Z220 070",          "finished_good","kom",    469,  2.85,  "qc_controller",  206519, "Visible A-surface; Sumitomo NC5 preferred for injection profile"],

      // ─── Large housings — JM1000 / JM1200 ────────────────────────────────────
      ["563088", "OHIŠJE ZG.A54 070",           "finished_good","kom",    605,  4.80,  null,             206407, "Single-cavity; 4-zone cooling; mold temp 35 °C; JM1000"],
      ["563354", "OHIŠJE SPD A54 070",          "finished_good","kom",    1407, 7.50,  null,             206441, "Heavy ~1.4 kg; JM1200 required for shot weight; back pressure 80 bar"],

      // ─── Raw materials & masterbatches (no toolId) ───────────────────────────
      ["19301",  "PP NATURAL",           "raw_material", "kg", null, 1.20, null, null, "Natural PP homopolymer; used for small colourless components"],
      ["666729", "PP BAZA NATURAL",      "raw_material", "kg", null, 1.10, null, null, "PP base resin for black parts; coloured with CB masterbatch 126828 at ~2%"],
      ["126828", "MASTERBATCH CRNI 40%", "masterbatch",  "kg", null, 3.50, null, null, "40% carbon-black masterbatch; dosed ~2% by weight into PP base"],
      ["21023",  "HIPS",                 "raw_material", "kg", null, 1.45, null, null, "High-impact polystyrene; used for egg-tray containers"],
      ["355210", "PS TRANSPARENT",       "raw_material", "kg", null, 1.80, null, null, "Crystal PS for optical lens and transparent parts; very slow injection"],
    ];

    await queryInterface.bulkInsert(
      "Items",
      rows.map(([itemCode, name, category, unit, , priceEurPerUnit, approvalLevel, toolInvNr, notes]) => ({
        id: randomUUID(),
        itemCode,
        name,
        category,
        unit,
        priceEurPerUnit: priceEurPerUnit ?? null,
        approvalLevel: approvalLevel ?? null,
        toolId: mold[toolInvNr] ?? null,
        pictures: JSON.stringify([]),
        documents: JSON.stringify([]),
        notes: notes ?? null,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Items", {
      itemCode: [
        "396420", "449104", "449179", "449130",
        "528933", "134880", "135781",
        "132989", "135827", "135833",
        "408017", "576346", "408278",
        "407982", "576345", "798219",
        "563088", "563354",
        "19301", "666729", "126828", "21023", "355210",
      ],
    });
  },
};
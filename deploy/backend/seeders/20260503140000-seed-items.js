"use strict";

const { randomUUID } = require("crypto");

/**
 * Items trimmed to match the current mold set (201840, 202032, 202842, 206215)
 * and the 3-machine test setup (#5 Engel 300, #20 JM800, #32 Arburg 220).
 *
 * Finished goods (one per active mold):
 *   396420 — GUMB TERMOSTATA H M4 070     mold 206215  Arburg #32
 *   528933 — POSODA ZA JAJCA H54 000      mold 202032  JM800  #20
 *   135781 — POSODA ZELENJAVE H54 VIS.087  mold 201840  JM800  #20  (black MB)
 *   135782 — POSODA ZELENJAVE H54 VIS.087 BELA  mold 201840  JM800  #20  (white MB)
 *   408278 — USMERNIK ZRAKA A6 ZF 070     mold 202842  Engel  #5
 *
 * Raw materials used by BOM lines:
 *   19301  — PP NATURAL            (→ 396420)
 *   21023  — HIPS                  (→ 528933)
 *   666729 — PP BAZA NATURAL       (→ 135781, 135782, 408278)
 *   126828 — MASTERBATCH CRNI 40%  (→ 135781, 408278)
 *   127100 — MASTERBATCH BELI 40%  (→ 135782)
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [moldRows] = await queryInterface.sequelize.query(
      `SELECT id, "inventoryNumber" FROM "Molds"
       WHERE "inventoryNumber" IN (201840, 202032, 202842, 206215);`,
    );
    const mold = {};
    moldRows.forEach((r) => {
      mold[r.inventoryNumber] = r.id;
    });

    // [itemCode, name, category, unit, pieceWeightG, priceEurPerUnit, approvalLevel, toolInvNr, notes]
    const rows = [
      // ─── Finished goods ────────────────────────────────────────────────────────
      [
        "396420",
        "GUMB TERMOSTATA H M4 070",
        "component",
        "kom",
        7,
        0.09,
        null,
        206215,
        "PP; 4-cavity; runs on Arburg 220 #32",
      ],
      [
        "528933",
        "POSODA ZA JAJCA H54 000",
        "finished_good",
        "kom",
        28,
        0.35,
        null,
        202032,
        "Hot-runner 4-zone; JM800 #20",
      ],
      [
        "135781",
        "POSODA ZELENJAVE H54 VIS.087",
        "finished_good",
        "kom",
        370,
        1.85,
        null,
        201840,
        "PP black; centering ring 200 mm; JM800 #20",
      ],
      [
        "135782",
        "POSODA ZELENJAVE H54 VIS.087 BELA",
        "finished_good",
        "kom",
        370,
        1.85,
        null,
        201840,
        "PP white; centering ring 200 mm; JM800 #20",
      ],
      [
        "408278",
        "USMERNIK ZRAKA A6 ZF 070",
        "finished_good",
        "kom",
        598,
        2.4,
        null,
        202842,
        "Thin-wall 1.5 mm PP; fast injection; Engel 300 #5",
      ],

      // ─── Raw materials ─────────────────────────────────────────────────────────
      [
        "19301",
        "PP NATURAL",
        "raw_material",
        "kg",
        null,
        1.2,
        null,
        null,
        "Natural PP homopolymer; used for small colourless components",
      ],
      [
        "21023",
        "HIPS",
        "raw_material",
        "kg",
        null,
        1.45,
        null,
        null,
        "High-impact polystyrene; used for egg-tray containers",
      ],
      [
        "666729",
        "PP BAZA NATURAL",
        "raw_material",
        "kg",
        null,
        1.1,
        null,
        null,
        "PP base resin; coloured with masterbatch at ~2%",
      ],
      [
        "126828",
        "MASTERBATCH CRNI 40%",
        "masterbatch",
        "kg",
        null,
        3.5,
        null,
        null,
        "40% carbon-black masterbatch; dosed ~2% by weight into PP base",
      ],
      [
        "127100",
        "MASTERBATCH BELI 40%",
        "masterbatch",
        "kg",
        null,
        3.8,
        null,
        null,
        "40% white (TiO2) masterbatch; dosed ~2% by weight into PP base",
      ],
    ];

    await queryInterface.bulkInsert(
      "Items",
      rows.map(
        ([
          itemCode,
          name,
          category,
          unit,
          ,
          priceEurPerUnit,
          approvalLevel,
          toolInvNr,
          notes,
        ]) => ({
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
        }),
      ),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Items", {
      itemCode: [
        "396420",
        "528933",
        "135781",
        "135782",
        "408278",
        "19301",
        "21023",
        "666729",
        "126828",
        "127100",
      ],
    });
  },
};

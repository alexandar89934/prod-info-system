"use strict";

const { randomUUID } = require("crypto");

/**
 * BOM lines for the trimmed 5-finished-goods test set.
 *
 *   396420 GUMB TERMOSTATA H M4 070          → 19301  PP NATURAL            7.00 g/kom
 *   528933 POSODA ZA JAJCA H54 000           → 21023  HIPS                 28.84 g/kom
 *   135781 POSODA ZELENJAVE H54 VIS.087      → 666729 PP BAZA NATURAL     380.73 g/kom
 *                                            → 126828 MASTERBATCH CRNI 40%  7.77 g/kom
 *   135782 POSODA ZELENJAVE H54 VIS.087 BELA → 666729 PP BAZA NATURAL     380.73 g/kom
 *                                            → 127100 MASTERBATCH BELI 40%  7.77 g/kom
 *   408278 USMERNIK ZRAKA A6 ZF 070          → 666729 PP BAZA NATURAL     615.73 g/kom
 *                                            → 126828 MASTERBATCH CRNI 40% 12.31 g/kom
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [itemRows] = await queryInterface.sequelize.query(
      `SELECT id, "itemCode" FROM "Items"
       WHERE "itemCode" IN ('19301', '21023', '666729', '126828', '127100', '396420', '528933', '135781', '135782', '408278');`
    );
    const item = {};
    itemRows.forEach((r) => { item[r.itemCode] = r.id; });

    // [outputItemCode, inputItemCode, quantityPerPiece, unit, notes]
    const lines = [
      ["396420", "19301",    7.00,  "g", "NORMATIV: 7.00 g/kom (IZRAČUN col 19301)"],
      ["528933", "21023",   28.84,  "g", "inferred: piece weight 28 g + ~3% runner"],
      ["135781", "666729", 380.73,  "g", "NORMATIV: 380.73 g/kom"],
      ["135781", "126828",   7.77,  "g", "NORMATIV: 7.77 g/kom"],
      ["135782", "666729", 380.73,  "g", "NORMATIV: 380.73 g/kom"],
      ["135782", "127100",   7.77,  "g", "NORMATIV: 7.77 g/kom"],
      ["408278", "666729", 615.73,  "g", "inferred: piece weight 598 g + ~3% runner"],
      ["408278", "126828",  12.31,  "g", "inferred: 2% CB masterbatch of 615.73 g shot"],
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
      `SELECT id FROM "Items" WHERE "itemCode" IN ('396420', '528933', '135781', '135782', '408278');`
    );
    const ids = itemRows.map((r) => r.id);
    if (ids.length) {
      await queryInterface.bulkDelete("BomLines", { outputItemId: ids });
    }
  },
};
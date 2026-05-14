"use strict";

const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const molds = [
      { inventoryNumber: 201840, name: "POSODA ZA ZELENJAVO H54-361830" },
      { inventoryNumber: 202032, name: "POSODA ZA JAJCA H54 361829" },
      { inventoryNumber: 202842, name: "USMERNIK ZRAKA ZF A6 408278" },
      { inventoryNumber: 206215, name: "GUMB TERMOSTATA" },
    ];

    await queryInterface.bulkInsert(
      "Molds",
      molds.map((m) => ({
        id: randomUUID(),
        inventoryNumber: m.inventoryNumber,
        name: m.name,
        status: "ok",
        pieceCounter: 0,
        cavities: null,
        requiredClampingForceKN: null,
        heightMM: null,
        widthMM: null,
        depthMM: null,
        centeringDiameterMM: null,
        temperingTemperatures: JSON.stringify([]),
        weight: null,
        pictures: JSON.stringify([]),
        documents: JSON.stringify([]),
        serviceCategory: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Molds", {
      inventoryNumber: [
        201647, 201658, 201659, 201840, 202032, 202033, 202111, 202120, 202123,
        202170, 202171, 202215, 202309, 202310, 202312, 202384, 202391, 202441,
        202443, 202448, 202450, 202451, 202594, 202601, 202674, 202675, 202676,
        202686, 202687, 202691, 202758, 202761, 202842, 202877, 202905, 202906,
        202907, 202939, 202940, 202953, 202956, 202961, 202972, 202979, 202980,
        202981, 202999, 203000, 203001, 203003, 203007, 203008, 203009, 203013,
        203040, 203066, 203067, 203100, 203838, 203839, 204366, 204375, 204376,
        204377, 204383, 204384, 204397, 204582, 204736, 204772, 204817, 204985,
        204991, 204992, 205133, 205280, 205485, 205635, 205898, 205902, 205946,
        205947, 205983, 205991, 206001, 206187, 206189, 206204, 206215, 206229,
        206230, 206231, 206233, 206300, 206302, 206306, 206308, 206407, 206441,
        206497, 206505, 206519, 206522, 206532, 206542, 206610, 206611, 206612,
        206615, 206617, 206628, 206635, 206636, 206638, 206643, 206649, 206650,
        206660, 206744, 206748, 206754, 206756, 206772, 206799, 206800, 206801,
        206923, 206925, 207026, 207305, 207444, 207446, 207481, 207482, 207483,
        207518, 207521, 207582, 207972, 207974, 208055, 209929, 209930,
      ],
    });
  },
};

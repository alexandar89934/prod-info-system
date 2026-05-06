"use strict";

const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("PackagingUnits", [
      {
        id: randomUUID(),
        name: "Kutija",
        description: "Standardna kartonska kutija za manje gotove proizvode",
        picture: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Kavez",
        description: "Metalni žičani kavez za skupni transport srednje velikih dijelova",
        picture: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Paleta",
        description: "Drvena euro paleta za slaganje kutija ili velikih sklopova",
        picture: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("PackagingUnits", {
      name: ["Kutija", "Kavez", "Paleta"],
    });
  },
};
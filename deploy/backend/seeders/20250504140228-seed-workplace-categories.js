"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "WorkplaceCategory",
      [
        {
          name: "Uprava",
          description: "Pozicije vezane za upravljanje",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Magacin",
          description: "Pozicije vezane za magacinske operacije",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Transport",
          description: "Pozicije vezane za transport i logistiku",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Proizvodnja",
          description: "Pozicije vezane za proizvodnju",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Održavanje",
          description: "Pozicije vezane za održavanje opreme",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Regleri",
          description: "Pozicije vezane za podešavanje i montiranje alata",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kontrola",
          description: "Pozicije vezane za kontrolu kvaliteta",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Komercijala",
          description: "Pozicije vezane za komercijalne aktivnosti",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("WorkplaceCategory", null, {});
  },
};

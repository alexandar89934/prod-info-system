"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("MachineAvailabilityStatuses", [
      {
        name: "Radi",
        description: "Mašina je u pogonu i spremna za rad",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Stoji",
        description: "Mašina je zaustavljena i trenutno nije u upotrebi",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Kvar",
        description: "Mašina je u kvaru i nije operativna",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("MachineAvailabilityStatuses", null, {});
  },
};

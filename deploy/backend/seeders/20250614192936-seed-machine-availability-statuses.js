"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("MachineAvailabilityStatuses", [
      {
        name: "Available",
        description: "Machine is ready for use",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Under Maintenance",
        description: "Machine is currently being serviced",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Unavailable",
        description: "Machine is not operational",
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

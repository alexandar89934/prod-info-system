"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("MachineEquipmentTypes", [
      {
        name: "Robot",
        description:
          "Omogućava automatski rad prese bez potrebe za ručnim ubacivanjem i izbacivanjem komada",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bojler",
        description:
          "Zagreva alat kako bi mašina dostigla radnu temperaturu pre početka obrade",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Transportna traka",
        description:
          "Usmerava gotove komade iz prese ka pakirnoj jedinici ili sledećoj stanici",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("MachineEquipmentTypes", null, {});
  },
};

"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get MachineEquipmentTypes to fetch their IDs
    const [types] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "MachineEquipmentTypes";`,
    );

    const typeMap = {};
    types.forEach((type) => {
      typeMap[type.name] = type.id;
    });

    const now = new Date();

    await queryInterface.bulkInsert("MachineEquipment", [
      {
        name: "ABB IRB 6700",
        model: "6700-155/2.85",
        serialNumber: "ROBOT-001",
        type: typeMap["Robot"] || null,
        description: "Robotska ruka za automatizovano pozicioniranje delova",
        documents: JSON.stringify([]),
        pictures: JSON.stringify([]),
        createdBy: "system",
        updatedBy: "system",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Buderus Logano",
        model: "G234X",
        serialNumber: "BOJLER-001",
        type: typeMap["Bojler"] || null,
        description: "Industrijski bojler za prethodno zagrevanje alata",
        documents: JSON.stringify([]),
        pictures: JSON.stringify([]),
        createdBy: "system",
        updatedBy: "system",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Conveyor Pro",
        model: "TP-500",
        serialNumber: "TRAKA-001",
        type: typeMap["Transportna traka"] || null,
        description: "Transportna traka sa senzorima za sortiranje",
        documents: JSON.stringify([]),
        pictures: JSON.stringify([]),
        createdBy: "system",
        updatedBy: "system",
        createdAt: now,
        updatedAt: now,
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("MachineEquipment", null, {});
  },
};

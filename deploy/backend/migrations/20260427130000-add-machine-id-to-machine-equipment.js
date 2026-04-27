"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.addColumn("MachineEquipment", "machineId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "Machines",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.removeColumn("MachineEquipment", "machineId");
  },
};
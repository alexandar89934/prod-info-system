"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.addColumn("Molds", "currentMachineId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "Machines", key: "id" },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.removeColumn("Molds", "currentMachineId");
  },
};
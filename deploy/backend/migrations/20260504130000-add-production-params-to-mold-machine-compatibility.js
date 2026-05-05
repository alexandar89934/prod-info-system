"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.addColumn("MoldMachineCompatibility", "normPerShift", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("MoldMachineCompatibility", "pieceWeightG", {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
    });
    await queryInterface.addColumn("MoldMachineCompatibility", "runnerWeightG", {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.removeColumn("MoldMachineCompatibility", "runnerWeightG");
    await queryInterface.removeColumn("MoldMachineCompatibility", "pieceWeightG");
    await queryInterface.removeColumn("MoldMachineCompatibility", "normPerShift");
  },
};
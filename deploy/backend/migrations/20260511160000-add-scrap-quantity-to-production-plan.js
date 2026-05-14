"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.addColumn("ProductionPlan", "scrapQuantity", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },
  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.removeColumn("ProductionPlan", "scrapQuantity");
  },
};
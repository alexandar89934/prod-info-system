"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_setup_started';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_setup_completed';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'cycle_completed';
    `);
  },

  async down() {
    // PostgreSQL enum values cannot be removed without recreating the type
  },
};
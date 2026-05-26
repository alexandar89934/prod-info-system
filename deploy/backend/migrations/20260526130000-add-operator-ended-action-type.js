"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'operator_ended';
    `);
  },

  async down() {
    // PostgreSQL enum values cannot be removed without recreating the type
  },
};
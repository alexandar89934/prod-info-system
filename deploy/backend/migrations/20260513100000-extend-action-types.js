"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        RENAME VALUE 'package_full' TO 'packaging_unit_full';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_service_started';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_service_ended';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_repair_started';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_repair_ended';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'plan_resumed';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType" ADD VALUE 'machine_fault_reported';
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        RENAME VALUE 'packaging_unit_full' TO 'package_full';
    `);
    // Note: added enum values (machine_service_*) cannot be removed without recreating the type
  },
};
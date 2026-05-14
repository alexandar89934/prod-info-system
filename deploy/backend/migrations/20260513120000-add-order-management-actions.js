"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    // Extend enum with management action types
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        ADD VALUE IF NOT EXISTS 'plan_created';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        ADD VALUE IF NOT EXISTS 'plan_updated';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        ADD VALUE IF NOT EXISTS 'order_created';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ProductionPlanActions_actionType"
        ADD VALUE IF NOT EXISTS 'order_updated';
    `);

    // Make productionPlanId nullable (order-level actions have no plan)
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlanActions"
        ALTER COLUMN "productionPlanId" DROP NOT NULL;
    `);

    // Add customerOrderId for order-level actions
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlanActions"
        ADD COLUMN IF NOT EXISTS "customerOrderId" UUID
          REFERENCES "CustomerOrders"("id") ON DELETE SET NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_production_plan_actions_order_id"
        ON "ProductionPlanActions" ("customerOrderId");
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "idx_production_plan_actions_order_id";
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlanActions"
        DROP COLUMN IF EXISTS "customerOrderId";
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlanActions"
        ALTER COLUMN "productionPlanId" SET NOT NULL;
    `);
  },
};

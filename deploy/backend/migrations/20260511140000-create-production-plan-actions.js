"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_ProductionPlanActions_actionType" AS ENUM (
        'mold_change_started',
        'mold_change_completed',
        'plan_started',
        'first_good_part_approved',
        'operator_started',
        'operator_changed',
        'scrap_entry',
        'qty_increased',
        'package_full',
        'quality_checked',
        'plan_stopped',
        'plan_completed',
        'plan_change_started'
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE "ProductionPlanActions" (
        "id"                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        "productionPlanId"     UUID         NOT NULL REFERENCES "ProductionPlan"("id") ON DELETE CASCADE,
        "actionType"           "enum_ProductionPlanActions_actionType" NOT NULL,
        "performedByPersonId"  UUID         REFERENCES "Person"("id") ON DELETE SET NULL,
        "performedByName"      VARCHAR(200),
        "quantity"             INTEGER,
        "scrapReason"          VARCHAR(50),
        "packagingUnitId"      UUID         REFERENCES "PackagingUnits"("id") ON DELETE SET NULL,
        "packagingUnitName"    VARCHAR(200),
        "notes"                TEXT,
        "timestamp"            TIMESTAMP    NOT NULL DEFAULT NOW(),
        "createdAt"            TIMESTAMP    NOT NULL DEFAULT NOW(),
        "updatedAt"            TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX "idx_production_plan_actions_plan_id"
        ON "ProductionPlanActions" ("productionPlanId");
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "ProductionPlanActions";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_ProductionPlanActions_actionType";`);
  },
};
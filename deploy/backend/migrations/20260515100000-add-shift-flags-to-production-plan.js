'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlan"
        ADD COLUMN IF NOT EXISTS "shift1" BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "shift2" BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "shift3" BOOLEAN NOT NULL DEFAULT TRUE;
    `);
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlan"
        DROP COLUMN IF EXISTS "shift1",
        DROP COLUMN IF EXISTS "shift2",
        DROP COLUMN IF EXISTS "shift3";
    `);
  },
};
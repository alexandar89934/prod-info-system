"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Attendance"
        ADD COLUMN "overtimeStatus" VARCHAR(10) CHECK ("overtimeStatus" IN ('pending', 'approved', 'rejected')),
        ADD COLUMN "systemClosed"  BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN "isManualEntry" BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN "editedBy"      UUID REFERENCES "Person"(id) ON DELETE SET NULL,
        ADD COLUMN "editedAt"      TIMESTAMP;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Attendance"
        DROP COLUMN IF EXISTS "overtimeStatus",
        DROP COLUMN IF EXISTS "systemClosed",
        DROP COLUMN IF EXISTS "isManualEntry",
        DROP COLUMN IF EXISTS "editedBy",
        DROP COLUMN IF EXISTS "editedAt";
    `);
  },
};
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Items"
        DROP COLUMN IF EXISTS "pdfFile",
        DROP COLUMN IF EXISTS "image",
        ADD COLUMN IF NOT EXISTS "pictures"  JSONB NOT NULL DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS "documents" JSONB NOT NULL DEFAULT '[]';
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Items"
        DROP COLUMN IF EXISTS "pictures",
        DROP COLUMN IF EXISTS "documents",
        ADD COLUMN IF NOT EXISTS "pdfFile" TEXT,
        ADD COLUMN IF NOT EXISTS "image"   TEXT;
    `);
  },
};
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    // Drop the global unique constraint on name
    await queryInterface.sequelize.query(`
      ALTER TABLE "JobPosition"
        DROP CONSTRAINT IF EXISTS "Workplace_name_key",
        DROP CONSTRAINT IF EXISTS "JobPosition_name_key";
    `);

    // Add unique per (name, categoryId) so the same role can exist in multiple categories
    await queryInterface.sequelize.query(`
      ALTER TABLE "JobPosition"
        ADD CONSTRAINT "jobposition_name_category_unique" UNIQUE (name, "categoryId");
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "JobPosition"
        DROP CONSTRAINT IF EXISTS "jobposition_name_category_unique";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "JobPosition"
        ADD CONSTRAINT "JobPosition_name_key" UNIQUE (name);
    `);
  },
};
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "SystemConfig" (key, value, description, "createdAt", "updatedAt")
      VALUES
        ('standardBreakMinutes', '40', 'Mandatory break deduction in minutes subtracted from raw presence time to calculate net work time', NOW(), NOW())
      ON CONFLICT (key) DO NOTHING;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "SystemConfig" WHERE key = 'standardBreakMinutes';
    `);
  },
};
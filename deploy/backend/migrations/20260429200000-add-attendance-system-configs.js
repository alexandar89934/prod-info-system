"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "SystemConfig" (key, value, description, "createdAt", "updatedAt")
      VALUES
        ('maxShiftMinutes',         '1080', 'Maximum legitimate shift duration in minutes used to detect forgotten checkouts (default 18h)', NOW(), NOW()),
        ('shiftGracePeriodMinutes', '15',   'Minutes before shift start that do not count as working time (early arrival buffer)',           NOW(), NOW()),
        ('overtimeMinimumMinutes',  '40',   'Minimum overtime minutes required to trigger the overtime approval workflow',                   NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "SystemConfig"
      WHERE key IN ('maxShiftMinutes', 'shiftGracePeriodMinutes', 'overtimeMinimumMinutes');
    `);
  },
};

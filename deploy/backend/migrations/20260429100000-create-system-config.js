"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "SystemConfig" (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value VARCHAR(255) NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO "SystemConfig" (key, value, description, "createdAt", "updatedAt")
      VALUES
        ('standardWorkMinutes', '480',  'Standard work minutes per shift (default 8h = 480 min)',           NOW(), NOW()),
        ('overtimeMultiplier',  '1.5',  'Pay rate multiplier for overtime minutes',                         NOW(), NOW()),
        ('nightMultiplier',     '1.5',  'Pay rate multiplier for night-shift minutes',                      NOW(), NOW()),
        ('weekendMultiplier',   '2.0',  'Pay rate multiplier for weekend minutes',                          NOW(), NOW()),
        ('nightStartHour',      '22',   'Hour (0-23) at which the night window begins (inclusive)',         NOW(), NOW()),
        ('nightEndHour',        '6',    'Hour (0-23) at which the night window ends (exclusive)',           NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "SystemConfig";`);
  },
};
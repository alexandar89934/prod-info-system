"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('pristup_kiosku_masine', 'Pristup kiosku mašine', 'Pravo pristupa kiosk modu za mašine i prebacivanja između mašina', TRUE, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility" WHERE "code" = 'pristup_kiosku_masine';
    `);
  },
};
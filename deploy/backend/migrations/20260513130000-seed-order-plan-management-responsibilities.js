"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('kreiranje_naloga',  'Kreiranje naloga',  'Pravo kreiranja kupovnog naloga',        TRUE, NOW(), NOW()),
        ('izmena_naloga',     'Izmena naloga',     'Pravo izmene kupovnog naloga',           TRUE, NOW(), NOW()),
        ('kreiranje_plana',   'Kreiranje plana',   'Pravo kreiranja plana proizvodnje',      TRUE, NOW(), NOW()),
        ('izmena_plana',      'Izmena plana',      'Pravo izmene plana proizvodnje',         TRUE, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE "code" IN ('kreiranje_naloga', 'izmena_naloga', 'kreiranje_plana', 'izmena_plana');
    `);
  },
};
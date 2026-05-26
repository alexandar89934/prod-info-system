'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM "Responsibility" WHERE code = 'izmena_operatera'`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES (
        'izmena_operatera',
        'Izmena operatera na mašini',
        'Promena operatera koji aktivno radi na planu produkcije',
        TRUE, NOW(), NOW()
      )
      ON CONFLICT (code) DO NOTHING
    `);
  },
};
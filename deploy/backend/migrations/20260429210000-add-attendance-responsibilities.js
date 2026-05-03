"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('odobrenje_prekovremenog', 'Odobrenje prekovremenog rada', 'Odobrava ili odbija prekovremeni rad zaposlenih u evidenciji',         TRUE, NOW(), NOW()),
        ('rucni_unos_prisustva',   'Ručni unos prisustva',         'Direktno dodaje zapise o prisustvu bez prolaska kroz zahtev',          TRUE, NOW(), NOW()),
        ('rucna_izmena_prisustva', 'Ručna izmena prisustva',       'Direktno menja postojeće zapise o prisustvu bez prolaska kroz zahtev', TRUE, NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE code IN ('odobrenje_prekovremenog', 'rucni_unos_prisustva', 'rucna_izmena_prisustva');
    `);
  },
};
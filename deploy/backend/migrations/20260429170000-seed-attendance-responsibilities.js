"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('pregled_prisustva_tima',       'Pregled prisustva tima',            'Pregled evidencije prisustva zaposlenih kojima je korisnik neposredni nadređeni',  TRUE, NOW(), NOW()),
        ('pregled_svih_prisustva',      'Pregled prisustva svih zaposlenih', 'Pregled evidencije prisustva svih zaposlenih u sistemu',                           TRUE, NOW(), NOW()),
        ('izmena_prisustva',            'Izmena evidencije prisustva',       'Podnošenje zahteva za izmenu zapisa o prisustvu (zahtev odobrava direktor)',        TRUE, NOW(), NOW()),
        ('odobrenje_izmene_prisustva',  'Odobrenje izmene prisustva',        'Odobriti ili odbiti zahtev za izmenu zapisa o prisustvu',                          TRUE, NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE code IN (
        'pregled_prisustva_tima',
        'pregled_svih_prisustva',
        'izmena_prisustva',
        'odobrenje_izmene_prisustva'
      );
    `);
  },
};
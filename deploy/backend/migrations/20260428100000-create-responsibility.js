"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "Responsibility" (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(200) NOT NULL,
        description TEXT,
        "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('otpust_serije_kk',          'Otpust serije — kontrolor kvaliteta',   'Potpisati otpust serije nakon inspekcije kvaliteta',               TRUE, NOW(), NOW()),
        ('otpust_serije_sef_smene',   'Otpust serije — šef smene',             'Potvrditi otpust serije kao šef smene',                           TRUE, NOW(), NOW()),
        ('odobrenje_prvog_komada',    'Odobrenje prvog komada',                'Odobriti ili odbiti probne komade nakon pokretanja mašine',        TRUE, NOW(), NOW()),
        ('resavanje_zastoja',         'Rešavanje zastoja u proizvodnji',       'Ukloniti zastoj u proizvodnji koji je izdala kontrola kvaliteta',  TRUE, NOW(), NOW()),
        ('odobrenje_odmora',          'Odobrenje godišnjih odmora',            'Odobriti ili odbiti zahteve za godišnji odmor i bolovanje',        TRUE, NOW(), NOW()),
        ('odluka_neusaglasenosti',    'Odluka o neusaglašenosti (NCR)',        'Odlučiti o ishodu zapisa o neusaglašenosti (škart/prepravka/isporuka)', TRUE, NOW(), NOW()),
        ('raspored_radnika',          'Raspored radnika na mašine',            'Dodeliti radnike i reglere na mašine i smene',                    TRUE, NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "Responsibility";`);
  },
};
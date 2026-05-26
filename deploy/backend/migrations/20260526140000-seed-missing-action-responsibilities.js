"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('pokretanje_podesavanja_masine', 'Pokretanje podešavanja mašine',     'Regler za puštanje pokreće fino podešavanje mašine nakon izmene kalupa',            TRUE, NOW(), NOW()),
        ('zavrsetak_podesavanja_masine',  'Završetak podešavanja mašine',       'Regler za puštanje potvrđuje da je mašina podešena i spremna za produkciju',         TRUE, NOW(), NOW()),
        ('zavrsetak_ciklusa',             'Završetak ciklusa ubrizgavanja',      'Automatska ili ručna potvrda završenog ciklusa ubrizgavanja na mašini',              TRUE, NOW(), NOW()),
        ('zavrsetak_rada_operatera',      'Završetak rada operatera na planu',  'Operater završava rad na planu produkcije i odjavljuje se sa mašine',                TRUE, NOW(), NOW()),
        ('nastavak_plana',                'Nastavak plana produkcije',           'Plan produkcije se nastavlja nakon privremenog zaustavljanja',                        TRUE, NOW(), NOW()),
        ('pokretanje_servisa_masine',     'Pokretanje servisa mašine',           'Tehničar pokreće redovni servis mašine',                                             TRUE, NOW(), NOW()),
        ('zavrsetak_servisa_masine',      'Završetak servisa mašine',            'Tehničar potvrđuje da je redovni servis mašine završen',                             TRUE, NOW(), NOW()),
        ('pokretanje_popravke_masine',    'Pokretanje popravke mašine',          'Tehničar pokreće popravku mašine zbog kvara ili oštećenja',                          TRUE, NOW(), NOW()),
        ('zavrsetak_popravke_masine',     'Završetak popravke mašine',           'Tehničar potvrđuje da je popravka mašine završena i mašina ispravna',                TRUE, NOW(), NOW()),
        ('prijava_kvara_masine',          'Prijava kvara mašine',                'Operater ili tehničar prijavljuje kvar mašine tokom produkcije',                     TRUE, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE code IN (
        'pokretanje_podesavanja_masine', 'zavrsetak_podesavanja_masine', 'zavrsetak_ciklusa',
        'zavrsetak_rada_operatera', 'nastavak_plana',
        'pokretanje_servisa_masine', 'zavrsetak_servisa_masine',
        'pokretanje_popravke_masine', 'zavrsetak_popravke_masine', 'prijava_kvara_masine'
      );
    `);
  },
};
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('nastavak_plana',            'Nastavak plana produkcije',         'Regler ili šef smene nastavlja pauziran plan produkcije',                   TRUE, NOW(), NOW()),
        ('pokretanje_servisa_masine', 'Pokretanje servisa mašine',         'Mehaničar ili servisni tehničar pokreće servisnu intervenciju na mašini',   TRUE, NOW(), NOW()),
        ('zavrsetak_servisa_masine',  'Završetak servisa mašine',          'Mehaničar ili servisni tehničar potvrđuje završetak servisa mašine',        TRUE, NOW(), NOW()),
        ('pokretanje_popravke_masine','Pokretanje popravke mašine',        'Mehaničar pokreće popravku na mašini koja je u kvaru',                      TRUE, NOW(), NOW()),
        ('zavrsetak_popravke_masine', 'Završetak popravke mašine',         'Mehaničar potvrđuje da je popravka mašine uspešno završena',                TRUE, NOW(), NOW()),
        ('prijava_kvara_masine',      'Prijava kvara mašine',              'Operator ili šef smene prijavljuje kvar na mašini',                         TRUE, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE code IN (
        'nastavak_plana', 'pokretanje_servisa_masine', 'zavrsetak_servisa_masine',
        'pokretanje_popravke_masine', 'zavrsetak_popravke_masine', 'prijava_kvara_masine'
      );
    `);
  },
};
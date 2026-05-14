"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        ('pokretanje_izmene_kalupa',  'Pokretanje izmene kalupa',          'Regler pokreće izmenu kalupa pre pokretanja plana produkcije',                  TRUE, NOW(), NOW()),
        ('zavrsetak_izmene_kalupa',   'Završetak izmene kalupa',           'Regler potvrđuje da je izmena kalupa završena i mašina spremna za pokretanje',   TRUE, NOW(), NOW()),
        ('pokretanje_plana',          'Pokretanje plana produkcije',        'Regler pokreće plan na mašini i potvrđuje start produkcije',                    TRUE, NOW(), NOW()),
        ('odobrenje_prvog_komada_kk', 'Odobrenje prvog dobrog komada',     'Kontrolor kvaliteta odobrava prvi ispravni komad nakon pokretanja mašine',      TRUE, NOW(), NOW()),
        ('pocetak_rada_operatera',    'Početak rada operatera na planu',   'Operater počinje rad na planu produkcije',                                       TRUE, NOW(), NOW()),
        ('unos_skarta_produkcija',    'Unos škarta u produkciji',          'Unos broja i razloga škarta u toku ili na kraju produkcije',                     TRUE, NOW(), NOW()),
        ('povecanje_kolicine',        'Ažuriranje količine komada',        'Unos trenutne količine proizvedenih komada u toku plana',                        TRUE, NOW(), NOW()),
        ('potvrda_pune_kaveze',       'Potvrda pune kaveze',               'Operater potvrđuje da je kavez pun i spreman za preuzimanje od strane magacina', TRUE, NOW(), NOW()),
        ('izmena_operatera',          'Izmena operatera na mašini',        'Promena operatera koji aktivno radi na planu produkcije',                        TRUE, NOW(), NOW()),
        ('kontrola_kk_u_produkciji',  'Kontrola kvaliteta u produkciji',   'Kontrolor kvaliteta vrši pregled komada u toku produkcije',                      TRUE, NOW(), NOW()),
        ('zaustavljanje_plana',       'Zaustavljanje plana produkcije',    'Plan produkcije je privremeno zaustavljen',                                       TRUE, NOW(), NOW()),
        ('zavrsetak_plana',           'Završetak plana produkcije',        'Plan produkcije je uspešno završen i potvrđena finalna količina',                TRUE, NOW(), NOW()),
        ('pokretanje_promene_plana',  'Pokretanje promene plana',          'Šef smene pokreće promenu plana bez potrebe za izmenom kalupa',                  TRUE, NOW(), NOW());
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      DELETE FROM "Responsibility"
      WHERE code IN (
        'pokretanje_izmene_kalupa', 'zavrsetak_izmene_kalupa', 'pokretanje_plana', 'odobrenje_prvog_komada_kk',
        'pocetak_rada_operatera', 'unos_skarta_produkcija', 'povecanje_kolicine',
        'potvrda_pune_kaveze', 'izmena_operatera', 'kontrola_kk_u_produkciji',
        'zaustavljanje_plana', 'zavrsetak_plana', 'pokretanje_promene_plana'
      );
    `);
  },
};

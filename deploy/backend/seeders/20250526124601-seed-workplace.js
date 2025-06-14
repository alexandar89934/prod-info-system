"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM "WorkplaceCategory";`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    await queryInterface.bulkInsert(
      "Workplace",
      [
        {
          name: "Direktor",
          description: "Odgovoran za celokupno poslovanje",
          categoryId: categoryMap["Uprava"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Planer",
          description: "Odgovoran za planiranje proizvodnje",
          categoryId: categoryMap["Uprava"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Magacioner",
          description: "Rukuje zalihama u magacinu",
          categoryId: categoryMap["Magacin"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Šef magacina",
          description: "Odgovoran za organizaciju rada u magacinu",
          categoryId: categoryMap["Magacin"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Vozač",
          description: "Prevozi robu i materijale",
          categoryId: categoryMap["Transport"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Operater mašine",
          description: "Upravlja proizvodnim mašinama",
          categoryId: categoryMap["Proizvodnja"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Serviser",
          description: "Održava i popravlja opremu",
          categoryId: categoryMap["Održavanje"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Šef održavanja",
          description: "Organizuje i nadgleda aktivnosti održavanja",
          categoryId: categoryMap["Održavanje"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Regler",
          description: "Podešava i montira alate",
          categoryId: categoryMap["Regleri"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Šef reglera",
          description: "Koordinira aktivnosti podešavanja alata",
          categoryId: categoryMap["Regleri"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kontrolor kvaliteta",
          description: "Vrši kontrolu kvaliteta proizvoda",
          categoryId: categoryMap["Kontrola"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Komercijalista",
          description: "Vodi prodaju i odnose sa kupcima",
          categoryId: categoryMap["Komercijala"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Workplace", null, {});
  },
};

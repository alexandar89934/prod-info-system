"use strict";

const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("Companies", [
      {
        id: randomUUID(),
        name: "SZR SIMIL ILIĆ MIROSLAV PREDUZETNIK",
        pib: "102867025",
        mb: "55947139",
        address: "Valjevo",
        phones: JSON.stringify(["014215510", "014215754", "0638597843", "0641357392"]),
        emails: JSON.stringify([{ address: "similoffice@gmail.com", isPrimary: true }]),
        ownerInfo: "Miroslav Ilić (100,00%)",
        representative: "Miroslav Ilić, Direktor",
        isOwnCompany: true,
        isCustomer: false,
        isSupplier: false,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Gorenje d.o.o.",
        pib: "100000001",
        mb: "10000001",
        address: null,
        phones: JSON.stringify([]),
        emails: JSON.stringify([]),
        ownerInfo: null,
        representative: null,
        isOwnCompany: false,
        isCustomer: true,
        isSupplier: false,
        notes: "Vlasnik određenih kalupa u fabrici",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Hisense Group Co. Ltd.",
        pib: "100000002",
        mb: "10000002",
        address: null,
        phones: JSON.stringify([]),
        emails: JSON.stringify([]),
        ownerInfo: null,
        representative: null,
        isOwnCompany: false,
        isCustomer: true,
        isSupplier: false,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Companies", {
      pib: ["102867025", "100000001", "100000002"],
    });
  },
};
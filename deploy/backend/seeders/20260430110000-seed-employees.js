"use strict";

const crypto = require("crypto");
require("dotenv").config();

function hashPassword(plain) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plain,
      process.env.HASH_SALT,
      1000,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString("hex"));
      },
    );
  });
}

const EMPLOYEES = [
  {
    name: "Aksentijević Leposava",
    number: 54,
    address: "Cara Lazara 12, Kruševac",
    positions: ["Operater mašine"],
  },
  {
    name: "Andrić Miloš",
    number: 126,
    address: "Vojvode Putnika 7, Jagodina",
    positions: ["Vozač"],
  },
  {
    name: "Birmanac Života",
    number: 10,
    address: "Svetosavska 33, Paraćin",
    positions: ["Regler"],
  },
  {
    name: "Blanuša Mitar",
    number: 232,
    address: "Knez Mihailova 18, Ćuprija",
    positions: ["Operater mašine"],
  },
  {
    name: "Davidović Jovan",
    number: 157,
    address: "Moše Pijade 5, Kragujevac",
    positions: ["Šef smene", "Operater mašine"],
  },
  {
    name: "Domanović Milutin",
    number: 81,
    address: "Kralja Petra 22, Čačak",
    positions: ["Operater mašine"],
  },
  {
    name: "Dragićević Đorđe",
    number: 188,
    address: "Nemanjina 9, Niš",
    positions: ["Serviser"],
  },
  {
    name: "Drajić Danijela",
    number: 207,
    address: "Bulevar Oslobođenja 41, Beograd",
    positions: ["Operater mašine"],
  },
  {
    name: "Đurđević Milica",
    number: 15,
    address: "Partizanska 6, Šabac",
    positions: ["Operater mašine"],
  },
  {
    name: "Grujić Mila",
    number: 52,
    address: "Vuka Karadžića 14, Smederevo",
    positions: ["Operater mašine"],
  },
  {
    name: "Ilić Miroslav",
    number: 1,
    address: "Milana Tepića 3, Beograd",
    positions: ["Direktor"],
  },
  {
    name: "Ivanović Milica",
    number: 227,
    address: "Železnička 27, Užice",
    positions: ["Operater mašine"],
  },
  {
    name: "Jevtić Gordana",
    number: 3,
    address: "Slobodana Jovanovića 11, Leskovac",
    positions: ["Operater mašine"],
  },
  {
    name: "Jevtić Jelena",
    number: 221,
    address: "Borska 8, Zaječar",
    positions: ["Operater mašine"],
  },
  {
    name: "Jevtić Marko",
    number: 225,
    address: "Cara Dušana 16, Valjevo",
    positions: ["Operater mašine"],
  },
  {
    name: "Jolačić Marina",
    number: 5,
    address: "Mlade Bosne 2, Beograd",
    positions: ["Operater mašine"],
  },
  {
    name: "Jovanović Goran",
    number: 161,
    address: "Svetog Save 19, Novi Sad",
    positions: ["Operater mašine"],
  },
  {
    name: "Jovanović Mihailo",
    number: 223,
    address: "Industrijska 4, Kragujevac",
    positions: ["Magacioner"],
  },
  {
    name: "Jovanović Valentina",
    number: 23,
    address: "Knjaževačka 30, Pirot",
    positions: ["Magacioner"],
  },
  {
    name: "Jović Andrijana",
    number: 100,
    address: "Ratarska 13, Sombor",
    positions: ["Operater mašine"],
  },
  {
    name: "Kulinčević Katarina",
    number: 110,
    address: "Đure Jakšića 5, Subotica",
    positions: ["Operater mašine"],
  },
  {
    name: "Maksimović Goran",
    number: 222,
    address: "Omladinska 21, Zrenjanin",
    positions: ["Šef magacina", "Magacioner"],
  },
  {
    name: "Milovanović Marko",
    number: 11,
    address: "Prvomajska 17, Kruševac",
    positions: ["Šef reglera", "Regler"],
  },
  {
    name: "Mirković Aca",
    number: 53,
    address: "Miloša Obrenovića 38, Požarevac",
    positions: ["Šef smene", "Operater mašine"],
  },
  {
    name: "Ostojić Olivera",
    number: 36,
    address: "Dragoslava Srejovića 10, Kragujevac",
    positions: ["Kontrolor kvaliteta"],
  },
  {
    name: "Radovanović Aleksandar",
    number: 210,
    address: "Bulevar Kralja Aleksandra 55, Beograd",
    positions: ["Planer"],
  },
  {
    name: "Ranković Srećko",
    number: 153,
    address: "Vojvodanska 7, Novi Sad",
    positions: ["Šef održavanja", "Serviser"],
  },
  {
    name: "Vasiljević Nemanja",
    number: 322,
    address: "Kosovska 24, Jagodina",
    positions: ["Šef smene", "Operater mašine"],
  },
];

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Load all positions with their category names so we can resolve "Šef smene" per category
    const allPositions = await queryInterface.sequelize.query(
      `SELECT jp.id, jp.name, jpc.name AS "categoryName"
       FROM "JobPosition" jp
       JOIN "JobPositionCategory" jpc ON jpc.id = jp."categoryId"`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    // Map: positionName -> first match id (for unique-named positions)
    const positionByName = {};
    // Map: "Šef smene" -> categoryName -> id
    const shiftChiefByCategory = {};
    for (const p of allPositions) {
      if (p.name === "Šef smene") {
        shiftChiefByCategory[p.categoryName] = p.id;
      } else {
        positionByName[p.name] = p.id;
      }
    }

    // Load category for each named position so we can match "Šef smene" to the right category
    const categoryByPositionName = {};
    for (const p of allPositions) {
      if (p.name !== "Šef smene") {
        categoryByPositionName[p.name] = p.categoryName;
      }
    }

    const [[userRole]] = await queryInterface.sequelize.query(
      `SELECT id FROM "Role" WHERE name = 'User' LIMIT 1`,
    );
    if (!userRole)
      throw new Error('Role "User" not found — run role seeders first');

    for (const emp of EMPLOYEES) {
      // Skip if already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM "User" WHERE "employeeNumber" = :number`,
        {
          replacements: { number: emp.number },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
      if (existing) continue;

      const hashedPassword = await hashPassword(String(emp.number));

      const [[person]] = await queryInterface.sequelize.query(
        `INSERT INTO "Person" (name, address, mail, documents, "startDate", status, "createdAt", "updatedAt", "createdBy", "updatedBy")
         VALUES (:name, :address, :mail, '[]', NOW(), 'off', NOW(), NOW(), :name, :name)
         RETURNING id`,
        {
          replacements: {
            name: emp.name,
            address: emp.address,
            mail: `employee_${emp.number}@mail.com`,
          },
        },
      );

      const [[user]] = await queryInterface.sequelize.query(
        `INSERT INTO "User" ("employeeNumber", password, "personId", "createdAt", "updatedAt")
         VALUES (:number, :password, :personId, NOW(), NOW())
         RETURNING id`,
        {
          replacements: {
            number: emp.number,
            password: hashedPassword,
            personId: person.id,
          },
        },
      );

      await queryInterface.sequelize.query(
        `INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
         VALUES (:userId, :roleId, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        { replacements: { userId: user.id, roleId: userRole.id } },
      );

      // Resolve position IDs
      // For "Šef smene": use the category matching the employee's other position
      const otherPositionName = emp.positions.find((p) => p !== "Šef smene");
      const shiftChiefCategoryName = otherPositionName
        ? categoryByPositionName[otherPositionName]
        : "Proizvodnja";

      const resolvePositionId = (posName) =>
        posName === "Šef smene"
          ? shiftChiefByCategory[shiftChiefCategoryName]
          : positionByName[posName];

      for (const posName of emp.positions) {
        const positionId = resolvePositionId(posName);

        if (!positionId) {
          console.warn(
            `Position "${posName}" not found for employee ${emp.name} — skipping`,
          );
          continue;
        }

        await queryInterface.sequelize.query(
          `INSERT INTO "EmployeeJobPositions" ("userId", "jobPositionId", "createdAt", "updatedAt")
           VALUES (:userId, :positionId, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          { replacements: { userId: user.id, positionId } },
        );
      }

      // First position in the array is the current position
      const currentPositionId = resolvePositionId(emp.positions[0]);
      if (currentPositionId) {
        await queryInterface.sequelize.query(
          `UPDATE "Person" SET "currentPositionId" = :posId, "updatedAt" = NOW() WHERE id = :personId`,
          { replacements: { posId: currentPositionId, personId: person.id } },
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const numbers = EMPLOYEES.map((e) => e.number);

    await queryInterface.sequelize.query(
      `DELETE FROM "UserRoles"
       WHERE "userId" IN (SELECT id FROM "User" WHERE "employeeNumber" = ANY(:numbers))`,
      { replacements: { numbers } },
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "EmployeeJobPositions"
       WHERE "userId" IN (SELECT id FROM "User" WHERE "employeeNumber" = ANY(:numbers))`,
      { replacements: { numbers } },
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "Person"
       WHERE id IN (SELECT "personId" FROM "User" WHERE "employeeNumber" = ANY(:numbers))`,
      { replacements: { numbers } },
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "User" WHERE "employeeNumber" = ANY(:numbers)`,
      { replacements: { numbers } },
    );
  },
};

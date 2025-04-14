"use strict";

const crypto = require("crypto");
require("dotenv").config();

function hashSensitiveData(sensitiveData) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      sensitiveData,
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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const employeeNumber = process.env.ADMIN_EMPLOYEE_NUMBER;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    const [existingUser] = await queryInterface.sequelize.query(
      `
          SELECT u.*, p.name
          FROM "User" u
                 JOIN "Person" p ON u."personId" = p."id"
          WHERE u."employeeNumber" = CAST(:employeeNumber AS INTEGER)
        `,
      {
        replacements: { employeeNumber },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (!existingUser) {
      const hashedPassword = await hashSensitiveData(password);

      const [personResult] = await queryInterface.sequelize.query(
        `
            INSERT INTO "Person" ("name", "address", "mail", "documents", "startDate", "createdAt", "updatedAt", "createdBy", "updatedBy")
            VALUES (:name, :address, :mail, :documents, :startDate, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :name, :name)
            RETURNING id;
          `,
        {
          replacements: {
            name,
            address: "Initial address",
            mail: "initial@setup.com",
            documents: JSON.stringify([]),
            startDate: new Date(),
          },
        },
      );

      const person = personResult[0];

      const [userResult] = await queryInterface.sequelize.query(
        `
        INSERT INTO "User" ("employeeNumber", "password", "personId", "createdAt", "updatedAt")
        VALUES (:employeeNumber, :password, :personId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
        `,
        {
          replacements: {
            employeeNumber,
            password: hashedPassword,
            personId: person.id,
          },
          type: Sequelize.QueryTypes.INSERT,
        },
      );

      const user = userResult[0] || userResult;

      const roles = await queryInterface.sequelize.query(
        `SELECT * FROM "Role"`,
        {
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      for (const role of roles) {
        await queryInterface.sequelize.query(
          `
          INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
          VALUES (:userId, :roleId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          {
            replacements: {
              userId: user.id,
              roleId: role.id,
            },
          },
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const employeeNumber = process.env.ADMIN_EMPLOYEE_NUMBER;

    await queryInterface.sequelize.query(
      `DELETE FROM "UserRoles" WHERE "userId" IN (SELECT id FROM "User" WHERE "employeeNumber" = :employeeNumber)`,
      { replacements: { employeeNumber } },
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "User" WHERE "employeeNumber" = :employeeNumber`,
      { replacements: { employeeNumber } },
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "Person" WHERE "id" IN (SELECT "personId" FROM "User" WHERE "employeeNumber" = :employeeNumber)`,
      { replacements: { employeeNumber } },
    );
  },
};

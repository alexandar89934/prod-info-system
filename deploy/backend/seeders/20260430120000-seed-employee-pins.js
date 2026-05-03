"use strict";

const crypto = require("crypto");
require("dotenv").config();

function hashPin(pin) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      pin,
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

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const hashedPin = await hashPin("1111");

    await queryInterface.sequelize.query(
      `UPDATE "User" SET pin = :pin, "updatedAt" = NOW() WHERE pin IS NULL`,
      { replacements: { pin: hashedPin } },
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "User" SET pin = NULL, "updatedAt" = NOW()`,
    );
  },
};
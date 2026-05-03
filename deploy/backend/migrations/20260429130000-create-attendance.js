"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "Attendance" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "personId" UUID NOT NULL REFERENCES "Person"(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        "checkIn" TIMESTAMP NOT NULL,
        "checkOut" TIMESTAMP,
        "workMinutes" INTEGER,
        "regularMinutes" INTEGER,
        "overtimeMinutes" INTEGER,
        "nightMinutes" INTEGER,
        "weekendMinutes" INTEGER,
        "shiftType" VARCHAR(20) CHECK ("shiftType" IN ('first', 'second', 'night')),
        note TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "Attendance";`);
  },
};
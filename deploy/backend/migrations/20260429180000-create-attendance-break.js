"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "AttendanceBreak" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "attendanceId" UUID NOT NULL REFERENCES "Attendance"(id) ON DELETE CASCADE,
        "breakStart" TIMESTAMP NOT NULL,
        "breakEnd" TIMESTAMP,
        "breakMinutes" INTEGER,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "AttendanceBreak";`);
  },
};

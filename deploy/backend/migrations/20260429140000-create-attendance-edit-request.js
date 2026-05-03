"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "AttendanceEditRequest" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "attendanceId" UUID NOT NULL REFERENCES "Attendance"(id) ON DELETE CASCADE,
        "requestedBy" UUID NOT NULL REFERENCES "Person"(id) ON DELETE CASCADE,
        "originalValues" JSONB NOT NULL,
        "newValues" JSONB NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        "approvedBy" UUID REFERENCES "Person"(id) ON DELETE SET NULL,
        "approvedAt" TIMESTAMP,
        "rejectReason" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "AttendanceEditRequest";`);
  },
};
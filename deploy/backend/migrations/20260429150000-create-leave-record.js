"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "LeaveRecord" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "personId" UUID NOT NULL REFERENCES "Person"(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('vacation', 'sick', 'other')),
        "startDate" DATE NOT NULL,
        "endDate" DATE NOT NULL,
        "isHalfDay" BOOLEAN NOT NULL DEFAULT FALSE,
        "halfDayPart" VARCHAR(20) CHECK ("halfDayPart" IN ('morning', 'afternoon')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        "approvedBy" UUID REFERENCES "Person"(id) ON DELETE SET NULL,
        "approvedAt" TIMESTAMP,
        "requestNote" TEXT,
        "rejectReason" TEXT,
        documents JSONB NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "LeaveRecord";`);
  },
};
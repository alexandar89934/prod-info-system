'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE "Vehicles" (
        "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"              VARCHAR(255) NOT NULL,
        "type"              VARCHAR(50)  NOT NULL CHECK ("type" IN ('car', 'forklift', 'truck', 'other')),
        "licensePlate"      VARCHAR(50),
        "model"             VARCHAR(255),
        "yearOfManufacture" INTEGER,
        "notes"             TEXT,
        "createdAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "Vehicles" CASCADE`);
  },
};
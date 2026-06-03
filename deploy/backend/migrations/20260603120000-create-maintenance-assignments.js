'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE "MaintenanceAssignments" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "templateId" UUID        NOT NULL REFERENCES "MaintenanceTemplates"("id") ON DELETE CASCADE,
        "targetType" VARCHAR(50) NOT NULL CHECK ("targetType" IN ('machine', 'equipment', 'mold', 'vehicle')),
        "targetId"   UUID        NOT NULL,
        "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE ("templateId", "targetType", "targetId")
      )
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "MaintenanceAssignments" CASCADE`);
  },
};
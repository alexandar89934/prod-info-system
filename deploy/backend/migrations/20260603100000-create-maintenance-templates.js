'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "MaintenanceTemplates" (
        "id"            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"          VARCHAR(200)  NOT NULL,
        "targetType"    VARCHAR(50)   NOT NULL,
        "intervalType"  VARCHAR(50)   NOT NULL,
        "intervalValue" INTEGER       NULL,
        "notes"         TEXT          NULL,
        "createdAt"     TIMESTAMP     NOT NULL DEFAULT NOW(),
        "updatedAt"     TIMESTAMP     NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "MaintenanceTemplateSteps" (
        "id"          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "templateId"  UUID          NOT NULL REFERENCES "MaintenanceTemplates"("id") ON DELETE CASCADE,
        "stepOrder"   INTEGER       NOT NULL,
        "description" VARCHAR(500)  NOT NULL,
        "isRequired"  BOOLEAN       NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
      );
    `);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "MaintenanceTemplateSteps";
      DROP TABLE IF EXISTS "MaintenanceTemplates";
    `);
  },
};
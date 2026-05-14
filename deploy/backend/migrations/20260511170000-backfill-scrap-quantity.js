"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.sequelize.query(`
      UPDATE "ProductionPlan" pp
      SET "scrapQuantity" = (
        SELECT COALESCE(SUM(ppa."quantity"), 0)
        FROM "ProductionPlanActions" ppa
        WHERE ppa."productionPlanId" = pp."id"
          AND ppa."actionType" = 'scrap_entry'
          AND ppa."quantity" > 0
      )
      WHERE pp."scrapQuantity" IS NULL;
    `);
  },
  async down() {},
};
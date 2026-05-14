"use strict";

require("dotenv").config();

/**
 * Creates the "Administrator" job position, assigns every responsibility to it,
 * and links the seeded admin user (ADMIN_EMPLOYEE_NUMBER) to it.
 *
 * Depends on:
 *   - seed-workplace-categories  (JobPositionCategory "Uprava" must exist)
 *   - seed-users                 (admin User must exist)
 *   - all responsibility migrations
 */

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const employeeNumber = process.env.ADMIN_EMPLOYEE_NUMBER;

    // ── 1. Resolve "Uprava" category ──────────────────────────────────────────
    const [[uprava]] = await queryInterface.sequelize.query(
      `SELECT id FROM "JobPositionCategory" WHERE name = 'Uprava' LIMIT 1`,
    );
    if (!uprava)
      throw new Error(
        '"Uprava" category not found — run workplace-category seeder first',
      );

    // ── 2. Create the Administrator job position (idempotent) ─────────────────
    await queryInterface.sequelize.query(
      `INSERT INTO "JobPosition" (name, description, "categoryId", "createdAt", "updatedAt")
       VALUES ('Administrator', 'Pun pristup svim funkcijama sistema', :categoryId, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      { replacements: { categoryId: uprava.id } },
    );

    const [[adminPosition]] = await queryInterface.sequelize.query(
      `SELECT id FROM "JobPosition" WHERE name = 'Administrator' LIMIT 1`,
    );

    // ── 3. Assign all responsibilities to the position ────────────────────────
    const responsibilities = await queryInterface.sequelize.query(
      `SELECT code FROM "Responsibility"`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    for (const { code } of responsibilities) {
      await queryInterface.sequelize.query(
        `INSERT INTO "JobPositionResponsibilities" ("jobPositionId", "responsibilityCode", "createdAt", "updatedAt")
         VALUES (:positionId, :code, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        { replacements: { positionId: adminPosition.id, code } },
      );
    }

    // ── 4. Link admin user to the position ────────────────────────────────────
    const [[adminUser]] = await queryInterface.sequelize.query(
      `SELECT id FROM "User" WHERE "employeeNumber" = :employeeNumber LIMIT 1`,
      { replacements: { employeeNumber } },
    );
    if (!adminUser) {
      console.warn(
        `Admin user (employeeNumber=${employeeNumber}) not found — skipping EmployeeJobPositions link`,
      );
      return;
    }

    await queryInterface.sequelize.query(
      `INSERT INTO "EmployeeJobPositions" ("userId", "jobPositionId", "createdAt", "updatedAt")
       VALUES (:userId, :positionId, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      { replacements: { userId: adminUser.id, positionId: adminPosition.id } },
    );

    await queryInterface.sequelize.query(
      `UPDATE "Person" SET "currentPositionId" = :positionId, "updatedAt" = NOW()
       WHERE id = (SELECT "personId" FROM "User" WHERE id = :userId)`,
      { replacements: { positionId: adminPosition.id, userId: adminUser.id } },
    );
  },

  async down(queryInterface) {
    const employeeNumber = process.env.ADMIN_EMPLOYEE_NUMBER;

    // Remove EmployeeJobPositions link
    await queryInterface.sequelize.query(
      `DELETE FROM "EmployeeJobPositions"
       WHERE "jobPositionId" = (SELECT id FROM "JobPosition" WHERE name = 'Administrator' LIMIT 1)
         AND "userId" = (SELECT id FROM "User" WHERE "employeeNumber" = :employeeNumber LIMIT 1)`,
      { replacements: { employeeNumber } },
    );

    // Remove all responsibilities from the position
    await queryInterface.sequelize.query(
      `DELETE FROM "JobPositionResponsibilities"
       WHERE "jobPositionId" = (SELECT id FROM "JobPosition" WHERE name = 'Administrator' LIMIT 1)`,
    );

    // Remove the position itself
    await queryInterface.sequelize.query(
      `DELETE FROM "JobPosition" WHERE name = 'Administrator'`,
    );
  },
};

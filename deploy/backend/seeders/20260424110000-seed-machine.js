"use strict";
const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const [statuses] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "MachineAvailabilityStatuses";`,
    );

    const statusMap = {};
    statuses.forEach((s) => {
      statusMap[s.name] = s.id;
    });

    const running = statusMap["Radi"] ?? null;

    // Columns: [name, machineNumber, serialNumber, yearOfManufacture, clampingForce,
    //   injectionWeight, maxMoldWidth, maxMoldHeight, minMoldThickness, maxMoldThickness,
    //   centeringRingFixedSide, centeringRingMovingSide, controlSystem]
    // Source: Podaci o mašinama.xlsx — "Razmak između vođica" → maxMoldWidth x maxMoldHeight
    const machines = [
      [
        "Cheng Hsong JM800-MK6",
        20,
        "AEFLC005",
        2022,
        8000,
        "2700",
        1000,
        1000,
        400,
        1000,
        "200",
        "200",
        "BACKOFF",
      ],
      [
        "Engel Victory 300",
        5,
        "208404",
        2016,
        3000,
        "750",
        1000,
        900,
        380,
        850,
        "160",
        "160",
        "CC300",
      ],
      [
        "Arburg 220-75-250",
        32,
        "137168",
        1987,
        500,
        "50",
        220,
        220,
        200,
        450,
        "110",
        "110",
        "HIDRONICA",
      ],
    ];

    const rows = machines
      .map(
        ([name, mn, sn, year, cf, iw, w, h, minT, maxT, crf, crm, cs]) =>
          `('${randomUUID()}', '${name}', ${mn}, '${sn}', ${year}, ${cf}, '${iw}', ${w}, ${h}, ${minT}, ${maxT}, '${crf}', '${crm}', '${cs}', NULL, '[]', '[]', NULL, NULL, NULL, false, false, false, 0, 0, 0, false, ${running}, 'system', 'system', NOW(), NOW())`,
      )
      .join(",\n      ");

    await queryInterface.sequelize.query(`
      INSERT INTO "Machines"
        ("id", "name", "machineNumber", "serialNumber",
         "yearOfManufacture", "clampingForce", "injectionWeight",
         "maxMoldWidth", "maxMoldHeight", "minMoldThickness", "maxMoldThickness",
         "centeringRingFixedSide", "centeringRingMovingSide", "controlSystem",
         "description", "pictures", "documents",
         "maxMoldWeight", "serviceInterval", "lastServiceDone",
         "automaticMode", "semiAutomaticMode", "manualMode",
         "workHoursCounter", "pieceCounter", "scrapCounter",
         "workPermit", "availabilityStatusId",
         "createdBy", "updatedBy", "createdAt", "updatedAt")
      VALUES
      ${rows}
      ON CONFLICT DO NOTHING
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Machines", null, {});
  },
};

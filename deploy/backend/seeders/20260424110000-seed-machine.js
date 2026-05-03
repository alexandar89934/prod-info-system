"use strict";
const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const [statuses] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "MachineAvailabilityStatuses";`
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
      ["Cheng Hsong JM1400-C3-SVP/2",    16, "AKDL2001",     2021, 14000, "5250",     1450, 1450, 650, 1450, "200",     "200",     "B&R"],
      ["Cheng Hsong JM1200-C3-SVP/2",    15, "AAKJ4001",     2019, 12000, "3600",     1250, 1250, 500, 1300, "200",     "200",     "B&R"],
      ["Cheng Hsong JM1000-MK6",          18, "AEFM6009",     2023, 10000, "3600",     1100, 1100, 450, 1200, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM1000-MK6",          14, "AEFM6010",     2023, 10000, "3600",     1100, 1100, 450, 1200, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM800-MK6",           22, "ACFL4006",     2023,  8000, "2700",     1000, 1000, 400, 1000, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM800-MK6",            2, "AEFL5001",     2022,  8000, "2700",     1000, 1000, 400, 1000, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM800-MK6",            3, "AEFL5002",     2022,  8000, "2700",     1000, 1000, 400, 1000, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM800-MK6",           20, "AEFLC005",     2022,  8000, "2700",     1000, 1000, 400, 1000, "200",     "200",     "BACKOFF"],
      ["Cheng Hsong JM800-MK6",           19, "ADFL9004",     2021,  8000, "2700",     1000, 1000, 400, 1000, "200",     "200",     "BACKOFF"],
      ["Krauss Maffei KM650-3500 C2",      1, "61006738",     2005,  6500, "2550",     1000,  900, 500,  950, "160-200", "160-200", "MC4"],
      ["Krauss Maffei KM650-1900-520 C2", 13, "61003065",     2003,  6500, "700 + 250",1000,  900, 450,  900, "160-200", "160-200", "MC4"],
      ["Cheng Hsong EM560-SVP/2",         23, "ABG91001",     2018,  5600, "1850",      850,  850, 330,  850, "160-200", "160-200", "B&R"],
      ["Krauss Maffei KM500-2700 C2",     24, "504104",       1999,  5000, "1950",      900,  800, 480,  900, "160",     "160",     "MC4"],
      ["Cheng Hsong JM468-MK6",           11, "86018",        2022,  4680, "1450",      800,  800, 300,  850, "160",     "160",     "BACKOFF"],
      ["Sumitomo Demag Intelect 450",      21, "72260011",     2018,  4500, "1450",      920,  920, 350,  850, "160",     "160",     "NC5"],
      ["Engel Victory 400",                9, "248760",       2021,  4000, "850",      1200, 1100, 450,  900, "160",     "160",     "CC300"],
      ["Engel Victory 400",                8, "248761",       2021,  4000, "850",      1200, 1100, 450,  900, "160",     "160",     "CC300"],
      ["Engel ES 350",                     4, "MK171010-HD",  1990,  3500, "800",       800,  800, 350,  760, "160",     "160",     "CC90"],
      ["Engel Victory 300",                5, "208404",       2016,  3000, "750",      1000,  900, 380,  850, "160",     "160",     "CC300"],
      ["Engel Victory 300",                6, "190118",       2013,  3000, "750",      1000,  900, 380,  850, "160",     "160",     "CC200"],
      ["Krauss Maffei KM300-1900 C2",      7, "254260",       1999,  3000, "1500",      630,  630, 330,  820, "160",     "160",     "MC4"],
      ["Krauss Maffei KM250-900 B2",      12, "253378",       1994,  2500, "550",       620,  550, 350,  750, "125-160", "125-160", "MC3"],
      ["Krauss Maffei KM200-620 B2",      10, "203136",       1993,  2000, "450",       560,  500, 330,  700, "125-160", "125-160", "MC3"],
      ["Krauss Maffei KM150-700 C2",      26, "154490",       1999,  1500, "550",       500,  500, 300,  600, "125",     "125",     "MC4"],
      ["Krauss Maffei KM150-900 B2",      30, "153172-KM900", 1992,  1500, "650",       500,  450, 280,  650, "125-160", "125-160", "MC3"],
      ["Krauss Maffei KM150-600 A",       31, "150239",       1983,  1500, "410",       500,  450, 280,  650, "125",     "125",     "MC1"],
      ["Battenfeld BA 1000/500 CDC",      25, "22695",        1999,  1000, "420",       420,  420, 250,  600, "125",     "125",     "Unlock 4000"],
      ["Arburg 420M-1000-250",            27, "161924",       1995,  1000, "200",       420,  420, 250,  650, "125",     "125",     "MULTRONICA"],
      ["Arburg 370C-600-200",             28, "153145",       1992,   800, "150",       370,  370, 250,  600, "125",     "125",     "MULTRONICA"],
      ["Arburg 370C-600-200",             29, "153144",       1991,   800, "150",       370,  370, 250,  600, "125",     "125",     "MULTRONICA"],
      ["Arburg 320-210-500",              35, "151704",       1991,   750, "350",       320,  320, 230,  600, "120",     "120",     "HIDRONICA"],
      ["Arburg 270-90-350",               36, "151779",       1991,   700, "350",       270,  270, 220,  550, "120",     "120",     "HIDRONICA"],
      ["Arburg 270-210-500",              33, "153172-ARB",   1987,   700, "350",       270,  270, 220,  550, "120",     "120",     "HIDRONICA"],
      ["Arburg 22M-350-75",               37, "173536",       1998,   500, "200",       220,  220, 200,  450, "110",     "110",     "MULTRONICA"],
      ["Arburg 221-175-350",              34, "115674",       1980,   500, "250",       220,  220, 200,  450, "110",     "110",     "PolytronICA"],
      ["Arburg 220-75-250",               32, "137168",       1987,   500, "50",        220,  220, 200,  450, "110",     "110",     "HIDRONICA"],
    ];

    const rows = machines
      .map(([name, mn, sn, year, cf, iw, w, h, minT, maxT, crf, crm, cs]) =>
        `('${randomUUID()}', '${name}', ${mn}, '${sn}', ${year}, ${cf}, '${iw}', ${w}, ${h}, ${minT}, ${maxT}, '${crf}', '${crm}', '${cs}', NULL, '[]', '[]', NULL, NULL, NULL, false, false, false, 0, 0, 0, false, ${running}, 'system', 'system', NOW(), NOW())`
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
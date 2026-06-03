import {
  CreateMaintenanceAssignmentsData,
  MaintenanceAssignment,
  TargetOption,
  TargetType,
} from '../service/maintenanceAssignment.service.types';
import { callQuery } from './utils/query';

export const getAllMaintenanceAssignmentsQuery = async (
  search: string,
  limit: number,
  offset: number
): Promise<{ rows: MaintenanceAssignment[]; total: number }> => {
  const param = `%${search}%`;
  const [rows, counts] = await Promise.all([
    callQuery<MaintenanceAssignment[]>(
      `SELECT
         ma."id", ma."templateId", ma."targetType", ma."targetId",
         ma."createdAt", ma."updatedAt",
         mt."name" AS "templateName",
         COALESCE(
           CASE WHEN ma."targetType" = 'machine'   THEN mach."name" END,
           CASE WHEN ma."targetType" = 'equipment' THEN equip."name" END,
           CASE WHEN ma."targetType" = 'mold'      THEN mold."name" END,
           CASE WHEN ma."targetType" = 'vehicle'   THEN veh."name" END
         ) AS "targetName"
       FROM "MaintenanceAssignments" ma
       LEFT JOIN "MaintenanceTemplates" mt    ON mt."id"   = ma."templateId"
       LEFT JOIN "Machines"             mach  ON ma."targetType" = 'machine'   AND mach."id"  = ma."targetId"
       LEFT JOIN "MachineEquipment"     equip ON ma."targetType" = 'equipment' AND equip."id" = ma."targetId"
       LEFT JOIN "Molds"                mold  ON ma."targetType" = 'mold'      AND mold."id"  = ma."targetId"
       LEFT JOIN "Vehicles"             veh   ON ma."targetType" = 'vehicle'   AND veh."id"   = ma."targetId"
       WHERE mt."name" ILIKE $1 OR COALESCE(
           CASE WHEN ma."targetType" = 'machine'   THEN mach."name" END,
           CASE WHEN ma."targetType" = 'equipment' THEN equip."name" END,
           CASE WHEN ma."targetType" = 'mold'      THEN mold."name" END,
           CASE WHEN ma."targetType" = 'vehicle'   THEN veh."name" END
         ) ILIKE $1
       ORDER BY mt."name" ASC, ma."targetType" ASC, "targetName" ASC
       LIMIT $2 OFFSET $3`,
      [param, limit, offset],
      true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "MaintenanceAssignments" ma
       LEFT JOIN "MaintenanceTemplates" mt    ON mt."id"   = ma."templateId"
       LEFT JOIN "Machines"             mach  ON ma."targetType" = 'machine'   AND mach."id"  = ma."targetId"
       LEFT JOIN "MachineEquipment"     equip ON ma."targetType" = 'equipment' AND equip."id" = ma."targetId"
       LEFT JOIN "Molds"                mold  ON ma."targetType" = 'mold'      AND mold."id"  = ma."targetId"
       LEFT JOIN "Vehicles"             veh   ON ma."targetType" = 'vehicle'   AND veh."id"   = ma."targetId"
       WHERE mt."name" ILIKE $1 OR COALESCE(
           CASE WHEN ma."targetType" = 'machine'   THEN mach."name" END,
           CASE WHEN ma."targetType" = 'equipment' THEN equip."name" END,
           CASE WHEN ma."targetType" = 'mold'      THEN mold."name" END,
           CASE WHEN ma."targetType" = 'vehicle'   THEN veh."name" END
         ) ILIKE $1`,
      [param],
      true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? '0', 10) };
};

export const getAssignmentsByTemplateQuery = async (
  templateId: string
): Promise<MaintenanceAssignment[]> => {
  const rows = await callQuery<MaintenanceAssignment[]>(
    `SELECT
       ma."id", ma."templateId", ma."targetType", ma."targetId",
       mt."name" AS "templateName",
       COALESCE(
         CASE WHEN ma."targetType" = 'machine'   THEN mach."name" END,
         CASE WHEN ma."targetType" = 'equipment' THEN equip."name" END,
         CASE WHEN ma."targetType" = 'mold'      THEN mold."name" END,
         CASE WHEN ma."targetType" = 'vehicle'   THEN veh."name" END
       ) AS "targetName"
     FROM "MaintenanceAssignments" ma
     LEFT JOIN "MaintenanceTemplates" mt    ON mt."id"   = ma."templateId"
     LEFT JOIN "Machines"             mach  ON ma."targetType" = 'machine'   AND mach."id"  = ma."targetId"
     LEFT JOIN "MachineEquipment"     equip ON ma."targetType" = 'equipment' AND equip."id" = ma."targetId"
     LEFT JOIN "Molds"                mold  ON ma."targetType" = 'mold'      AND mold."id"  = ma."targetId"
     LEFT JOIN "Vehicles"             veh   ON ma."targetType" = 'vehicle'   AND veh."id"   = ma."targetId"
     WHERE ma."templateId" = $1
     ORDER BY ma."targetType" ASC, "targetName" ASC`,
    [templateId],
    true
  );
  return rows ?? [];
};

export const getAvailableTargetsQuery = async (
  targetType: TargetType,
  templateId: string
): Promise<TargetOption[]> => {
  const tableMap: Record<TargetType, string> = {
    machine:   '"Machines"',
    equipment: '"MachineEquipment"',
    mold:      '"Molds"',
    vehicle:   '"Vehicles"',
  };
  const table = tableMap[targetType];
  const rows = await callQuery<TargetOption[]>(
    `SELECT t."id", t."name"
     FROM ${table} t
     WHERE NOT EXISTS (
       SELECT 1 FROM "MaintenanceAssignments" ma
       WHERE ma."templateId" = $1
         AND ma."targetType" = $2
         AND ma."targetId" = t."id"
     )
     ORDER BY t."name" ASC`,
    [templateId, targetType],
    true
  );
  return rows ?? [];
};

export const createMaintenanceAssignmentsQuery = async (
  data: CreateMaintenanceAssignmentsData
): Promise<MaintenanceAssignment[]> => {
  const created: MaintenanceAssignment[] = [];
  for (const targetId of data.targetIds) {
    const row = await callQuery<MaintenanceAssignment>(
      `INSERT INTO "MaintenanceAssignments" ("id", "templateId", "targetType", "targetId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
       ON CONFLICT ("templateId", "targetType", "targetId") DO NOTHING
       RETURNING *`,
      [data.templateId, data.targetType, targetId]
    );
    if (row) created.push(row);
  }
  return created;
};

export const deleteMaintenanceAssignmentQuery = async (id: string): Promise<void> => {
  await callQuery<number>(`DELETE FROM "MaintenanceAssignments" WHERE "id" = $1`, [id]);
};
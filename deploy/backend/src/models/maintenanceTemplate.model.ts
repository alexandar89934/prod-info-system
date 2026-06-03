import {
  CreateMaintenanceTemplateData,
  CreateMaintenanceTemplateStepData,
  EditMaintenanceTemplateData,
  MaintenanceTemplate,
  MaintenanceTemplateStep,
  MaintenanceTemplateWithStepCount,
  MaintenanceTemplateWithSteps,
} from "../service/maintenanceTemplate.service.types";
import { callQuery } from "./utils/query";

export const getAllMaintenanceTemplatesQuery = async (
  search: string,
  limit: number,
  offset: number
): Promise<{ rows: MaintenanceTemplateWithStepCount[]; total: number }> => {
  const param = `%${search}%`;
  const [rows, counts] = await Promise.all([
    callQuery<MaintenanceTemplateWithStepCount[]>(
      `SELECT mt.*,
              (SELECT COUNT(*) FROM "MaintenanceTemplateSteps" mts WHERE mts."templateId" = mt."id")::int AS "stepCount"
       FROM "MaintenanceTemplates" mt
       WHERE mt."name" ILIKE $1
       ORDER BY mt."name" ASC
       LIMIT $2 OFFSET $3`,
      [param, limit, offset],
      true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "MaintenanceTemplates" WHERE "name" ILIKE $1`,
      [param],
      true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? "0", 10) };
};

export const getMaintenanceTemplateByIdQuery = async (
  id: string
): Promise<MaintenanceTemplateWithSteps | null> => {
  const template = await callQuery<MaintenanceTemplate>(
    `SELECT * FROM "MaintenanceTemplates" WHERE "id" = $1`,
    [id]
  );
  if (!template) return null;
  const steps = await callQuery<MaintenanceTemplateStep[]>(
    `SELECT * FROM "MaintenanceTemplateSteps" WHERE "templateId" = $1 ORDER BY "stepOrder" ASC`,
    [id],
    true
  );
  return { ...template, steps: steps ?? [] };
};

export const createMaintenanceTemplateQuery = async (
  data: CreateMaintenanceTemplateData
): Promise<MaintenanceTemplateWithSteps> => {
  const template = await callQuery<MaintenanceTemplate>(
    `INSERT INTO "MaintenanceTemplates" ("id", "name", "targetType", "intervalType", "intervalValue", "notes", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [data.name, data.targetType, data.intervalType, data.intervalValue ?? null, data.notes ?? null]
  );
  const steps = await insertStepsQuery(template.id, data.steps);
  return { ...template, steps };
};

export const updateMaintenanceTemplateQuery = async (
  data: EditMaintenanceTemplateData
): Promise<MaintenanceTemplateWithSteps> => {
  const template = await callQuery<MaintenanceTemplate>(
    `UPDATE "MaintenanceTemplates"
     SET "name" = $1, "targetType" = $2, "intervalType" = $3, "intervalValue" = $4, "notes" = $5, "updatedAt" = NOW()
     WHERE "id" = $6
     RETURNING *`,
    [data.name, data.targetType, data.intervalType, data.intervalValue ?? null, data.notes ?? null, data.id]
  );
  await callQuery<MaintenanceTemplateStep>(
    `DELETE FROM "MaintenanceTemplateSteps" WHERE "templateId" = $1`,
    [data.id]
  );
  const steps = await insertStepsQuery(template.id, data.steps);
  return { ...template, steps };
};

export const deleteMaintenanceTemplateQuery = async (
  id: string
): Promise<MaintenanceTemplate> =>
  callQuery<MaintenanceTemplate>(
    `DELETE FROM "MaintenanceTemplates" WHERE "id" = $1 RETURNING *`,
    [id]
  );

const insertStepsQuery = async (
  templateId: string,
  steps: CreateMaintenanceTemplateStepData[]
): Promise<MaintenanceTemplateStep[]> => {
  if (steps.length === 0) return [];
  const inserted: MaintenanceTemplateStep[] = [];
  for (const step of steps) {
    const row = await callQuery<MaintenanceTemplateStep>(
      `INSERT INTO "MaintenanceTemplateSteps" ("id", "templateId", "stepOrder", "description", "isRequired", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [templateId, step.stepOrder, step.description, step.isRequired]
    );
    inserted.push(row);
  }
  return inserted;
};
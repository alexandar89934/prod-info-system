import { CreateVehicleData, EditVehicleData, Vehicle } from '../service/vehicle.service.types';
import { callQuery } from './utils/query';

export const getAllVehiclesQuery = async (
  search: string,
  limit: number,
  offset: number
): Promise<{ rows: Vehicle[]; total: number }> => {
  const param = `%${search}%`;
  const [rows, counts] = await Promise.all([
    callQuery<Vehicle[]>(
      `SELECT * FROM "Vehicles"
       WHERE "name" ILIKE $1
          OR COALESCE("licensePlate", '') ILIKE $1
          OR COALESCE("model", '') ILIKE $1
       ORDER BY "name" ASC
       LIMIT $2 OFFSET $3`,
      [param, limit, offset],
      true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "Vehicles"
       WHERE "name" ILIKE $1
          OR COALESCE("licensePlate", '') ILIKE $1
          OR COALESCE("model", '') ILIKE $1`,
      [param],
      true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? '0', 10) };
};

export const getVehicleByIdQuery = async (id: string): Promise<Vehicle | null> => {
  const row = await callQuery<Vehicle>(
    `SELECT * FROM "Vehicles" WHERE "id" = $1`,
    [id]
  );
  return row ?? null;
};

export const getVehicleListQuery = async (): Promise<Pick<Vehicle, 'id' | 'name'>[]> => {
  const rows = await callQuery<Pick<Vehicle, 'id' | 'name'>[]>(
    `SELECT "id", "name" FROM "Vehicles" ORDER BY "name" ASC`,
    [],
    true
  );
  return rows ?? [];
};

export const createVehicleQuery = async (data: CreateVehicleData): Promise<Vehicle> =>
  callQuery<Vehicle>(
    `INSERT INTO "Vehicles"
       ("id", "name", "type", "licensePlate", "model", "yearOfManufacture", "notes", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING *`,
    [data.name, data.type, data.licensePlate ?? null, data.model ?? null, data.yearOfManufacture ?? null, data.notes ?? null]
  );

export const updateVehicleQuery = async (data: EditVehicleData): Promise<Vehicle | null> => {
  const row = await callQuery<Vehicle>(
    `UPDATE "Vehicles"
     SET "name"=$1, "type"=$2, "licensePlate"=$3, "model"=$4,
         "yearOfManufacture"=$5, "notes"=$6, "updatedAt"=NOW()
     WHERE "id"=$7
     RETURNING *`,
    [data.name, data.type, data.licensePlate ?? null, data.model ?? null, data.yearOfManufacture ?? null, data.notes ?? null, data.id]
  );
  return row ?? null;
};

export const deleteVehicleQuery = async (id: string): Promise<void> => {
  await callQuery<number>(`DELETE FROM "Vehicles" WHERE "id" = $1`, [id]);
};
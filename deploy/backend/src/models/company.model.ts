import { Company, CreateCompanyData, EditCompanyData } from "../service/company.service.types";
import { callQuery } from "./utils/query";

export const getAllCompaniesQuery = async (
  search: string, limit: number, offset: number
): Promise<{ rows: Company[]; total: number }> => {
  const param = `%${search}%`;
  const [rows, counts] = await Promise.all([
    callQuery<Company[]>(
      `SELECT * FROM "Companies"
       WHERE "name" ILIKE $1 OR "pib" ILIKE $1 OR "mb" ILIKE $1
       ORDER BY "name" ASC LIMIT $2 OFFSET $3`,
      [param, limit, offset], true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "Companies"
       WHERE "name" ILIKE $1 OR "pib" ILIKE $1 OR "mb" ILIKE $1`,
      [param], true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? "0", 10) };
};

export const getCompanyByIdQuery = async (id: string): Promise<Company> =>
  callQuery<Company>(`SELECT * FROM "Companies" WHERE "id" = $1`, [id]);

export const getAllCompaniesListQuery = async (): Promise<Pick<Company, "id" | "name">[]> =>
  callQuery<Pick<Company, "id" | "name">[]>(
    `SELECT "id", "name" FROM "Companies" ORDER BY "name" ASC`, [], true
  );

export const createCompanyQuery = async (data: CreateCompanyData): Promise<Company> =>
  callQuery<Company>(
    `INSERT INTO "Companies"
       ("id", "name", "pib", "mb", "address", "phones", "emails",
        "ownerInfo", "representative", "isOwnCompany", "isCustomer", "isSupplier", "notes", "logo",
        "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
     RETURNING *`,
    [
      data.name, data.pib, data.mb, data.address ?? null,
      JSON.stringify(data.phones), JSON.stringify(data.emails),
      data.ownerInfo ?? null, data.representative ?? null,
      data.isOwnCompany, data.isCustomer, data.isSupplier,
      data.notes ?? null, data.logo ?? null,
    ]
  );

export const updateCompanyQuery = async (data: EditCompanyData): Promise<Company> =>
  callQuery<Company>(
    `UPDATE "Companies" SET
       "name" = $1, "pib" = $2, "mb" = $3, "address" = $4,
       "phones" = $5, "emails" = $6, "ownerInfo" = $7, "representative" = $8,
       "isOwnCompany" = $9, "isCustomer" = $10, "isSupplier" = $11,
       "notes" = $12, "logo" = $13, "updatedAt" = NOW()
     WHERE "id" = $14 RETURNING *`,
    [
      data.name, data.pib, data.mb, data.address ?? null,
      JSON.stringify(data.phones), JSON.stringify(data.emails),
      data.ownerInfo ?? null, data.representative ?? null,
      data.isOwnCompany, data.isCustomer, data.isSupplier,
      data.notes ?? null, data.logo ?? null, data.id,
    ]
  );

export const deleteCompanyQuery = async (id: string): Promise<Company> =>
  callQuery<Company>(`DELETE FROM "Companies" WHERE "id" = $1 RETURNING *`, [id]);
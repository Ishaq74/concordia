import { getDrizzle } from "@database/drizzle";
import * as schema from "@database/schemas";
import { count, ilike, or, desc } from "drizzle-orm";

export async function getAdminListData(
  collectionName: keyof typeof schema,
  table: any,
  options: { page?: number; pageSize?: number; search?: string; searchColumns?: any[]; withRelations?: any }
) {
  const db = await getDrizzle();
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const filters = options.search && options.searchColumns 
    ? or(...options.searchColumns.map(col => ilike(col, `%${options.search}%`)))
    : undefined;

  // @ts-ignore
  const queryApi = db.query[collectionName];

  const [data, totalResult] = await Promise.all([
    queryApi.findMany({
      where: filters,
      limit: pageSize,
      offset: offset,
      orderBy: [desc(table.createdAt || table.id)],
      with: options.withRelations
    }),
    db.select({ total: count() }).from(table).where(filters)
  ]);

  const total = Number(totalResult[0]?.total || 0);
  return { data, total, totalPages: Math.ceil(total / pageSize) };
}
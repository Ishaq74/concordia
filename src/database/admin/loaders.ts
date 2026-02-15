import { getDrizzle } from "../drizzle";
import * as schema from "../schemas"; // Importe tout ton schéma
import { count, ilike, or, desc } from "drizzle-orm";

interface AdminLoaderOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  searchColumns?: any[]; 
  withRelations?: any;
}

// On passe 'collectionName' qui est la clé dans db.query (ex: 'blogComments')
// ET 'table' qui est l'objet Drizzle pour le count()
export async function getAdminListData(
  collectionName: keyof typeof schema, 
  table: any, 
  options: AdminLoaderOptions
) {
  const db = await getDrizzle();
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const filters = options.search && options.searchColumns 
    ? or(...options.searchColumns.map(col => ilike(col, `%${options.search}%`)))
    : undefined;

  // @ts-ignore - On sait que la clé existe grâce au type collectionName
  const queryApi = db.query[collectionName];

  if (!queryApi) {
    throw new Error(`Collection "${String(collectionName)}" introuvable dans le schéma Drizzle.`);
  }

  const [data, totalResult] = await Promise.all([
    queryApi.findMany({
      where: filters,
      limit: pageSize,
      offset: offset,
      // On trie par createdAt si dispo, sinon on ne trie pas (ou par ID)
      orderBy: table.createdAt ? [desc(table.createdAt)] : undefined,
      with: options.withRelations
    }),
    db.select({ total: count() }).from(table).where(filters)
  ]);

  const total = Number(totalResult[0]?.total || 0);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
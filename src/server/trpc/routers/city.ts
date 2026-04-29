import { router, publicProcedure } from '../trpc';
import { db } from '../../db';
import { cities } from '../../db/schema';
import { eq, sql, and, like, inArray } from 'drizzle-orm';
import { z } from 'zod';

export const cityRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        minPopulation: z.number().optional(),
        maxPopulation: z.number().optional(),
        climates: z.array(z.string()).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(sql`${cities.name} ILIKE ${`%${input.search}%`}`);
      }

      if (input.minPopulation !== undefined) {
        conditions.push(sql`${cities.population} >= ${input.minPopulation}`);
      }

      if (input.maxPopulation !== undefined) {
        conditions.push(sql`${cities.population} <= ${input.maxPopulation}`);
      }

      if (input.climates && input.climates.length > 0) {
        conditions.push(sql`${cities.climate} IN (${input.climates.join(',')})`);
      }

      let query = db.select().from(cities);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      if (input.sortOrder === 'asc') {
        query = query.orderBy(cities.name);
      } else if (input.sortOrder === 'desc') {
        query = query.orderBy(sql`${cities.name} DESC`);
      }

      return await query;
    }),

  getByName: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const result = await db.select().from(cities).where(eq(cities.name, input));
      return result[0];
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const result = await db.select().from(cities).where(eq(cities.id, input));
      return result[0];
    }),

  getClimates: publicProcedure.query(async () => {
    const result = await db.selectDistinct({ climate: cities.climate }).from(cities);
    return result.map(r => r.climate);
  }),
});
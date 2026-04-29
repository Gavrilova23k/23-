import { router, protectedProcedure } from '../trpc';
import { db } from '../../db';
import { favorites, cities } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const favoritesRouter = router({
  // Получить избранные города пользователя
  getMyFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await db
        .select({
          id: favorites.id,
          cityId: cities.id,
          name: cities.name,
          description: cities.description,
          image: cities.image,
          population: cities.population,
          climate: cities.climate,
          createdAt: favorites.createdAt,
        })
        .from(favorites)
        .innerJoin(cities, eq(favorites.cityId, cities.id))
        .where(eq(favorites.userId, ctx.user.id));
      
      return result;
    }),

  // Добавить в избранное
  add: protectedProcedure
    .input(z.object({ cityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, есть ли уже в избранном
      const existing = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.user.id),
            eq(favorites.cityId, input.cityId)
          )
        );
      
      if (existing.length === 0) {
        await db.insert(favorites).values({
          userId: ctx.user.id,
          cityId: input.cityId,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }
      
      return { success: true };
    }),

  // Удалить из избранного
  remove: protectedProcedure
    .input(z.object({ cityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.user.id),
            eq(favorites.cityId, input.cityId)
          )
        );
      return { success: true };
    }),

  // Проверить, в избранном ли город
  isFavorite: protectedProcedure
    .input(z.object({ cityId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.user.id),
            eq(favorites.cityId, input.cityId)
          )
        );
      return result.length > 0;
    }),
});
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '../../db';
import { feedbacks, users, cities } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

export const feedbackRouter = router({
  // Получить отзывы для города (публичный)
  getByCity: publicProcedure
    .input(z.object({ cityId: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: feedbacks.id,
          message: feedbacks.message,
          rating: feedbacks.rating,
          createdAt: feedbacks.createdAt,
          userName: users.name,
          userImage: users.image,
        })
        .from(feedbacks)
        .innerJoin(users, eq(feedbacks.userId, users.id))
        .where(eq(feedbacks.cityId, input.cityId))
        .orderBy(desc(feedbacks.createdAt));
      
      return result;
    }),

  // Добавить отзыв (только для авторизованных)
  add: protectedProcedure
    .input(
      z.object({
        cityId: z.number(),
        message: z.string().min(5).max(1000),
        rating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Adding feedback for user:', ctx.user.id, 'city:', input.cityId);
      
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.insert(feedbacks).values({
        userId: ctx.user.id,
        cityId: input.cityId,
        message: input.message,
        rating: input.rating || 5,
        createdAt: now,
        updatedAt: now,
      }).returning();

      console.log('Feedback added:', result[0]?.id);
      return result[0];
    }),

  // Получить свои отзывы (только для авторизованных)
  getMyFeedbacks: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({
        id: feedbacks.id,
        message: feedbacks.message,
        rating: feedbacks.rating,
        createdAt: feedbacks.createdAt,
        cityName: cities.name,
      })
      .from(feedbacks)
      .innerJoin(cities, eq(feedbacks.cityId, cities.id))
      .where(eq(feedbacks.userId, ctx.user.id))
      .orderBy(desc(feedbacks.createdAt));
    
    return result;
  }),
});
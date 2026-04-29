import { router } from './trpc';
import { cityRouter } from './routers/city';
import { favoritesRouter } from './routers/favorites';
import { feedbackRouter } from './routers/feedback';
import { weatherRouter } from './routers/weather';

export const appRouter = router({
  city: cityRouter,
  favorites: favoritesRouter,
  feedback: feedbackRouter,
  weather: weatherRouter,
});

export type AppRouter = typeof appRouter;
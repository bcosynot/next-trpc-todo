/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { signupRouter } from './signup';
import { tasksRouter } from './task';
import { usersRouter } from './user';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  signup: signupRouter,
  tasks: tasksRouter,
  users: usersRouter,

});

export type AppRouter = typeof appRouter;

import { authedProcedure, router } from '../trpc';
import { prisma } from '../../common/prisma';
import { z } from 'zod';

export const usersRouter = router({
  byId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return prisma.user.findUnique({
        where: { id: input },
      });
    }),
  list: authedProcedure
    .input(z.null())
    .query(async () => {
    return prisma.user.findMany();
  }),
});

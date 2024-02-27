import { publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '../../common/prisma';
import { hash } from "argon2";
import { loginSchema } from '../../common/validation/auth';

export const signupRouter = router({
  signup: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const { username, password } = input;
      const exists = await prisma.user.findFirst({
        where: { username },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const hashedPassword = await hash(password);

      const result = await prisma.user.create({
        data: {  username, password: hashedPassword },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.username,
      };
    }),
});

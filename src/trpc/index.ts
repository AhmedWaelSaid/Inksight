import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import {string, z} from 'zod'
export const appRouter = router({
  authcallback: publicProcedure.query(async () => {
    try {
      console.log(" [tRPC] Running authcallback...");

      const session = getKindeServerSession();
      const user = await session.getUser();

      console.log(" [tRPC] Kinde user:", user);

      if (!user || !user.id || !user.email) {
        console.log(" [tRPC] Unauthorized: Missing user/id/email");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let dbUser = await db.user.findUnique({
        where: { id: user.id },
      });

      console.log(" [tRPC] Found user:", dbUser);

      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        });
        console.log(" [tRPC] Created new user:", dbUser);
      }

      return { success: true };
    } catch (err) {
      console.error(" [tRPC] Error in authcallback:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong in authcallback",
      });
    }
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found in context",
      });
    }

    const files = await db.file.findMany({
      where: { userId },
    });

    return files;
  }),

  deleteFile : privateProcedure.input(z.object({id : z.string()})).mutation( async ({ctx , input}) => {
    const {userId} = ctx
    const file = await db.file.findFirst({
      where:{
        id:input.id ,
        userId
      }
    })

    if(!file) throw new TRPCError({code:'NOT_FOUND'})
      
      await   db.file.delete({
        where:{
          id:input.id
        }
      })

      return file

  })
});

export type AppRouter = typeof appRouter;

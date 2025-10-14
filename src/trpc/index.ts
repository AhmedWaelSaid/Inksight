import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

export const appRouter = router({
  // 🧩 Public procedure: يتم استدعاؤه بعد تسجيل الدخول لأول مرة
  authcallback: publicProcedure.query(async () => {
    try {
      console.log("🟢 [tRPC] Running authcallback...");

      const session = getKindeServerSession();
      const user = await session.getUser();

      console.log("👤 [tRPC] Kinde user:", user);

      // تحقق من وجود المستخدم وبياناته الأساسية
      if (!user || !user.id || !user.email) {
        console.log("❌ [tRPC] Unauthorized: Missing user/id/email");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // التحقق مما إذا كان المستخدم موجودًا بالفعل في قاعدة البيانات
      let dbUser = await db.user.findUnique({
        where: { id: user.id },
      });

      console.log("🗄️ [tRPC] Found user:", dbUser);

      // إذا لم يكن موجودًا، يتم إنشاؤه
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        });
        console.log("✨ [tRPC] Created new user:", dbUser);
      }

      return { success: true };
    } catch (err) {
      console.error("💥 [tRPC] Error in authcallback:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong in authcallback",
      });
    }
  }),

  // 🧩 Private procedure: إرجاع ملفات المستخدم المسجل فقط
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in context" });
    }

    const files = await db.file.findMany({
      where: { userId },
    });

    return files;
  }),
});

// 🧠 Type inference لجعل client-side يعرف أنواع الـ API
export type AppRouter = typeof appRouter;


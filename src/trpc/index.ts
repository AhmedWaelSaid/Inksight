import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'

export const appRouter = router({
  authcallback: publicProcedure.query(async () => {
    try {
      console.log('🟢 [tRPC] Running authcallback...')

      // ✅ 1. نحصل على session من Kinde
      const session = getKindeServerSession()
      const user = await session.getUser()

      console.log('👤 [tRPC] Kinde user:', user)

      // ✅ 2. لو مفيش user → نرمي Unauthorized
      if (!user || !user.id || !user.email) {
        console.log('❌ [tRPC] Unauthorized: Missing user/id/email')
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      // ✅ 3. نبحث عن المستخدم في قاعدة البيانات
      let dbUser = await db.user.findUnique({
        where: { id: user.id },
      })

      console.log('🗄️ [tRPC] Found user:', dbUser)

      // ✅ 4. لو مش موجود، نضيفه
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        })
        console.log('✅ [tRPC] Created new user:', dbUser)
      }

      // ✅ 5. نرجع نتيجة ناجحة
      return { success: true }
    } catch (err) {
      console.error('🔥 [tRPC] Error in authcallback:', err)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong in authcallback',
      })
    }
  }),
})

export type AppRouter = typeof appRouter

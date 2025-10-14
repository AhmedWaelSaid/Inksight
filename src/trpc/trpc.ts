import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'

// 🧩 (1) إنشاء الـ context
export const createContext = async () => {
  const session = getKindeServerSession()
  const user = await session.getUser()

  return {
    user,
    userId: user?.id ?? null,
  }
}
export type Context = Awaited<ReturnType<typeof createContext>>

// 🧩 (2) تمرير الـ context إلى initTRPC
const t = initTRPC.context<Context>().create()
const middleware = t.middleware

// 🧩 (3) Middleware للتحقق من تسجيل الدخول
const isAuth = middleware(async (opts) => {
  const { ctx } = opts

  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return opts.next({
    ctx: {
      user: ctx.user,
      userId: ctx.userId,
    },
  })
})

// 🧩 (4) تصدير الأدوات المستخدمة لبناء الراوتر
export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/trpc'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      // 🧠 هنا بنجيب session المستخدم الحالي
      const session = getKindeServerSession()
      return { session }
    },
  })

export { handler as GET, handler as POST }

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/trpc'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const session = getKindeServerSession()
      const user = await session.getUser()
      return {
        user,
        userId: user?.id ?? null,
      }
    },
  })

export { handler as GET, handler as POST }

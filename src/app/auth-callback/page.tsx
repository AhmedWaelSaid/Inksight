import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db } from '@/db'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ origin?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const { getUser } = getKindeServerSession()
  
  let user
  try {
    user = await getUser()
  } catch {
    // Session expired or invalid, redirect to login
    redirect('/api/auth/kinde/login')
  }

  if (!user || !user.id || !user.email) {
    redirect('/api/auth/kinde/login')
  }

  // Check if user exists by email
  const existingUser = await db.user.findUnique({
    where: { email: user.email },
  })

  if (!existingUser) {
    try {
      // Create new user
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    } catch (error) {
      // Handle duplicate email race condition
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
        // User already exists, that's fine
      } else {
        // Re-throw other errors
        throw error
      }
    }
  }

  // Redirect to dashboard or origin
  redirect(params.origin ? `/${params.origin}` : '/dashboard')
}

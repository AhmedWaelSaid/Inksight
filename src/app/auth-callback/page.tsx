'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin') ?? undefined

 
  const { data, error, isError, isSuccess, isPending } =
    trpc.authcallback.useQuery(undefined, {
      retry: true,
      retryDelay: 500,
    })

  
  useEffect(() => {
    if (isSuccess && data?.success) {
      router.push(origin ? `/${origin}` : '/dashboard')
    }
  }, [isSuccess, data, origin, router])
 
  useEffect(() => {
    if (isError && error) {
      const code = (error as any)?.data?.code
      if (code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      } else {
        console.error('Auth error:', error)
      }
    }
  }, [isError, error, router])

 
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2
          className="h-8 w-8 animate-spin text-zinc-800"
          aria-label="Loading"
        />
        <h3 className="font-semibold text-xl">
          Setting up your account...
        </h3>
        <p>
          {isPending ? 'Contacting server...' : 'You will be redirected automatically.'}
        </p>
      </div>
    </div>
  )
}

export default Page

"use client"

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { trpc } from '@/app/_trpc/client'
import { useState } from 'react'

const UpgradeButton = () => {
  const [isLoading, setIsLoading] = useState(false)

  const {mutate: createStripeSession} = trpc.createStripeSession.useMutation({
    onSuccess: ({url}) => {
      window.location.href = url ?? "/dashboard"
    },
    onError: (error) => {
      console.error("Error creating Stripe session:", error)
      setIsLoading(false)
    }
  })

  const handleClick = () => {
    setIsLoading(true)
    createStripeSession()
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      className='w-full'>
      {isLoading ? "Loading..." : "Upgrade now"} 
      <ArrowRight className='h-5 w-5 ml-1.5' />
    </Button>
  )
}

export default UpgradeButton
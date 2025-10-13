"use client"
import { trpc } from "@/app/_trpc/client"
import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/react-query"
import { PropsWithChildren, ReactNode, useState } from "react"

interface Iprops {
    children : ReactNode
}

const Providers = ({children} : Iprops ) => {
    const [queryClient] = useState(()=> new QueryClient())
    
    const [trpcclient] = useState(()=>  trpc.createClient({links:[
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
        }),
      ]}))
  return (
    <trpc.Provider queryClient={queryClient} client={trpcclient}>
        
        {children}</trpc.Provider>
  )
}

export default Providers
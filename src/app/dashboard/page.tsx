
import Dashboard from "@/components/Dashboard"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { getUserSubscriptionPlan } from "@/lib/stripe"

const page = async () => {

    const {getUser} = getKindeServerSession()
    const user =  await getUser()
   if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const DbUser = await db.user.findFirst({
      where : {
        id: user.id
      }
    }
    )
   if (!DbUser) redirect('/auth-callback?origin=dashboard')

   const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    
   <Dashboard subscriptionPlan={subscriptionPlan}/>

  )
}

export default page
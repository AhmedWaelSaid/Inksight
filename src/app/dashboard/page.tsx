
import Dashboard from "@/components/Dashboard"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

interface Iprops {

}

const page = async  ({} : Iprops ) => {

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

  return (
    
   <Dashboard/>

  )
}

export default page
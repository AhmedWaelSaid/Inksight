
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

interface Iprops {

}

const page = async  ({} : Iprops ) => {

    const {getUser} = getKindeServerSession()
    const user =  await getUser()
   if (!user || !user.id) redirect('/auth-callback?origin=dashboard')
  

  return (
    
   <div></div>

  )
}

export default page
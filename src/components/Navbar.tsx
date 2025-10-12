import Link from "next/link"
import MaxwidthWrapper from './MaxwidthWrapper';
import { buttonVariants } from "./ui/button";
import { ArrowRight} from "lucide-react";
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';


interface Iprops {

}

const Navbar = ({} : Iprops ) => {
  return (
   <nav className="h-14 sticky bg-white/75 inset-x-0 top-0 z-30 w-full border-b border-gray-200 backdrop-blur-lg transition-all">
      <MaxwidthWrapper>
       <div className="flex h-14 items-center justify-between  border-zinc-200'">
          <Link
            href='/'
            className='flex z-40 font-semibold'>
            <span>Read-H.</span>
          </Link>
          <div className=" hidden items-center space-x-4 sm:flex">
            <>
            <Link href="/.pricing" className={buttonVariants({
              
              variant:"ghost" ,
              size: "sm"
              })}>pricing</Link>
              <LoginLink className={buttonVariants({
              
              variant:"ghost" ,
              size: "sm"
              })}>Login</LoginLink>
              <RegisterLink  className={buttonVariants({
              size: "sm",
              className:"text-zinc-700"
              })} >Sign-Up 
              <ArrowRight/>
              </RegisterLink>
            </>
          </div>
          </div>
          
          
          </MaxwidthWrapper>
      </nav>
  )
}

export default Navbar
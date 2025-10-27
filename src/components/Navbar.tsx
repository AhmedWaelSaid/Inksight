import Link from "next/link";
import MaxwidthWrapper from "./MaxwidthWrapper";
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import UseraccountNavbar from "./UseraccountNavbar";
import MobileNav from "./MobileNav";
import Image from "next/image";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return (
    <nav className="h-18 sticky bg-white/75 inset-x-0 top-0 z-30 w-full border-b border-gray-200 backdrop-blur-lg transition-all">
      <MaxwidthWrapper>
        <div className="flex h-14 items-center justify-between  border-zinc-200'">
          <Link href="/" className="flex z-40 font-semibold">
            
              <Image
                src="/inksight_logo.png"
                alt="Inksight"
                height={75}
                width={85}
                className="object-contain rounded-2xl"
              />
          
          </Link>
          <MobileNav isAuth={!!user} />
          <div className=" hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Login
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                    className: "text-zinc-700",
                  })}
                >
                  Sign-Up
                  <ArrowRight />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>

                <UseraccountNavbar
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxwidthWrapper>
    </nav>
  );
};

export default Navbar;

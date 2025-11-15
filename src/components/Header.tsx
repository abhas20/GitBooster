'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { ModeToggle } from './ui/ModeToggle'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'

function Header() {

  const {data:session} =useSession();

    const isUserLogged = session ? true:false;
    const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async ()=>{
    setIsLoading(true);
    try {
      await signOut({callbackUrl:"/login"});
      toast.success("Logged out successfully",{
        duration:2000,
        position:"top-center",
      });
      
    } catch (error) {
      console.log(error);
      toast.error("Error logging out. Please try again.",{
        duration:2000,
        position:"top-center",
      } );
    }
    finally{
      setIsLoading(false);
    }
  }


  return (
    <header className="bg-popover text-primary p-4 shadow-green-200 shadow-2xl hover:shadow-blue-400 rounded-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        

        <div className="flex items-center gap-4">
          <Link href={"/"} className="flex items-center gap-4">
            {/* <img
              src="./image.png"
              alt="notes"
              className="rounded-full border border-red size-10"
            /> */}
            <h1 className="text-xl sm:text-3xl italic font-bold leading-6 sm:leading-8 text-primary">
              GitBOOSTER
            </h1>
          </Link>
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-wrap justify-end items-center gap-3 sm:gap-4">
          {isUserLogged ? (
            <>
              {/* <Logout /> */}
              <Button variant="destructive" onClick={handleLogout}>
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/profile">Profile</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:block">
                <Link href="/signup">SignUp</Link>
              </Button>
            </>
          )}
          <ModeToggle/>
          </div>
        </div>
    </header>

  )
}

export default Header

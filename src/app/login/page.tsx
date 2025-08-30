'use client';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router= useRouter();

    const handleLogin = async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        console.log("Login form submitted");
        const formData=new FormData(e.currentTarget)
        try {
          setIsLoading(true);
          const res=await signIn("credentials",{
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            redirect:false,
          })
          if(res?.error) {
            toast.error(res.error, {
                duration: 2000,
                position: "top-center",
            });
          } else {
            toast.success("Login successful", {
                duration: 2000,
                position: "top-center",
            });
            router.push("/"); 
          }

          
        } catch (error) {
          console.error("Error during login:", error);
          toast.error("An unexpected error occurred", {
            duration: 2000,
            position: "top-center",
        });
        }
        finally {
          setIsLoading(false);
        }
    }

    const handleGithubLogin = async()=>{
      try {
        setIsLoading(true);
        await signIn("github",{callbackUrl:"/"});
        
      } catch (error) {
        console.log(error);
        toast.error("An unexpected error occurred", {
          duration: 2000,
          position: "top-center",
        });
      }
    }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <Card className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-center">Login to your account</CardTitle>
          <CardDescription>
            Welcome back! Please enter your credentials to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email"
                  name="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="off"
                  required
                  placeholder="password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading? "Logging.." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <CardAction className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </CardAction>
          <div className="flex items-center justify-between">
            <hr className="w-40" />
            <span className="px-2 text-muted-foreground">or</span>
            <hr className="w-40" />
          </div>
          <Button variant="outline" className="w-full text-muted-foreground" onClick={handleGithubLogin}>
            Login with GitHub
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage

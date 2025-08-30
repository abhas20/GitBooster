'use client';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

function SignupPage() {
  const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        console.log("Signup form submitted");
       try {
         setIsLoading(true);
         const formData=new FormData(e.currentTarget);
         const password=formData.get("password") as string;
         const confirmPassword=formData.get("confirm_password") as string;
         if(password !== confirmPassword) {
          toast.error("Password should match with confirm password",{
            duration:2000,
            position:"top-center",
          })
          return;
         }

         try {
          setIsLoading(true);
          const res = await axios.post(
            "/api/auth/register",
            {
              name: formData.get("name"),
              email: formData.get("email"),
              password: formData.get("password"),
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          if(res.status===201){
            toast.success("Account created successfully",{
              duration:2000,
              position:"top-center",
            });
            router.push("/login");
          }
          else{
            console.log(res.data.error.message);
            toast.error(res.data.error.message,{
              duration:2000,
              position:"top-center",
            });
          }
          
         } 
         catch (error) {
          console.log(error);
          toast.error("Something went wrong! Please try again.",{
            duration:2000,
            position:"top-center",
          });
         }
         finally{
          setIsLoading(false);
         }

       } catch (error) {
          console.log(error);
          toast.error("Something went wrong! Please try again.",{
            duration:2000,
            position:"top-center",
          });
       }
       finally{
        setIsLoading(false);
       }
    }   

    const handleGitHubSignIn=async()=>{
     await signIn("github",{callbackUrl:"/login"});
    }

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <Card className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-center">
              Welcome to Our platform
            </CardTitle>
            <CardDescription>
              Enter your details below to SignUp and start your journey with us.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Name</Label>
                  <Input
                    id="username"
                    type="username"
                    placeholder="username"
                    required
                    name="name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email"
                    required
                    name="email"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="password"
                    autoComplete="off"
                    required
                    name="password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="confirm password"
                    autoComplete="off"
                    required
                    name="confirm_password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin" color="#3e9392" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter className="flex-col gap-2">
            <CardAction className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Login
              </a>
            </CardAction>
            <div className="flex items-center justify-between">
              <hr className="w-40" />
              <span className="px-2 text-muted-foreground">or</span>
              <hr className="w-40" />
            </div>
            <Button variant="outline" className="w-full text-muted-foreground" onClick={handleGitHubSignIn}>
              Continue with GitHub
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default SignupPage

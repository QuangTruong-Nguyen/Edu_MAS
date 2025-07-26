"use client"
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkProvider } from '@clerk/nextjs';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect,useRef  } from "react"
import { useUser } from "@clerk/nextjs";
import { Roboto_Flex, Playfair_Display, Pirata_One, Spicy_Rice, Molle } from '@next/font/google';

const playfair = Playfair_Display({
    subsets: ["latin"], 
    weight: '700',
})

const roboto = Roboto_Flex({
    subsets: ["latin"], 
    weight: '1000',
})

const caprasimo = Spicy_Rice({
    subsets: ["latin"], 
    weight: '400',
})
// import Cookies from "js-cookie";


export default function Home() {
  const router = useRouter();
  // const { isLoaded, user,isSignedIn } = useUser();
  //   if (!isLoaded) {
  //   return <div>Loading...</div>;
  // }


  const { isLoaded, isSignedIn, user } = useUser();

  const hasSentUser = useRef(false);
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !hasSentUser.current) {
      hasSentUser.current = true; 

      fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.id, 
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.primaryEmailAddress?.emailAddress ?? "",
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);

        // Save user_id to cookie
        document.cookie = `userId=${user.id}`
        router.push(`/workspace/${user.id}`);
      })
      .catch(error => {
        console.error("Lỗi gửi thông tin user:", error);
      });
    }
  }, [isLoaded, isSignedIn, user]);
  
  // return (
  //   <div className="w-full h-full">

  //     <div className="flex sticky top-0 items-center justify-between p-3 bg-slate-200">
  //               <div className="flex items-center gap-2">
  //                 <div className="size-24 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700 rounded-full w-12 h-12 flex items-center justify-center">
  //                   <GraduationCap className="w-8 h-8 text-white" />
  //                 </div>
  //                 <span className="text-lg font-semibold">Educational Multiagent System</span>
  //               </div>
  //                 <header className="flex items-center gap-4">
  //                   <SignedIn>
  //                     <UserButton />
  //                   </SignedIn>
  //                 </header>
  //     </div>
  //     <div className="flex grid grid-rows-2 items-center justify-center pt-10">
  //       <h1 className="text-5xl font-bold font-sans">Welcome to Educational Multiagent System</h1>
          
  //         <div className="flex justify-center items-center pt-20">
  //           <div className="flex space-x-4">
  //             <SignedOut>
  //               <SignInButton mode="modal">
  //                 <Button>
  //                   Đăng nhập để bắt đầu
  //                 </Button>
  //               </SignInButton>
  //             </SignedOut>
  //           </div>
  //         </div>

  //     </div>
  
  //   </div>
  // );

  return (
  <div className="relative min-h-screen w-full overflow-x-hidden">

    <Image
      src="/anhNen3.jpg" 
      alt="Background"
      fill
      style={{ objectFit: "cover", zIndex: 0 }}
      className="fixed inset-0 -z-10 brightness-90"
      priority
    />

    {/* Nội dung phía trên ảnh nền */}
    <div className="relative z-10 w-full h-full">
      <div className="flex sticky top-0 items-center justify-between p-3 bg-slate-200">
        <div className="flex items-center gap-2">
          <div className="size-24 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700 rounded-full w-12 h-12 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className={`${roboto.className} text-lg font-semibold`}>EduGen•MAS</span>
        </div>
        <header className="flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>
      <div className="flex grid grid-rows-2 items-center justify-center">
        <h1 className={`${playfair.className} text-5xl font-bold font-sans text-white`}>Welcome to</h1>
        <h1 className={`${caprasimo.className} text-9xl font-extrabold font-sans text-white`}>EduGen • MAS</h1>

        <div className="flex justify-center items-center pt-20">
          <div className="flex space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                {/* <Button>
                  Đăng nhập để bắt đầu
                </Button> */}
                {/* <Button
                  className="rounded-full px-8 py-4 text-lg font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-600 text-white shadow-lg hover:scale-105 hover:shadow-2xl transition duration-200 border-none outline-none focus:ring-4 focus:ring-yellow-400/50 active:scale-95 tracking-wide"
                >
                  Đăng nhập để bắt đầu
                </Button> */}

                  <Button
                    className={`${roboto.className} w-40 px-5 py-5 text-md rounded-full text-white bg-white/10 backdrop-blur-xl border border-2 border-white hover:bg-gradient-to-r hover:from-white/20 hover:to-cyan-200/20 hover:text-cyan-200 hover:shadow-[0_4px_32px_0_rgba(132,148,255,0.35)] transition-all duration-200 outline-none focus:ring-4 focus:ring-cyan-300/40 active:scale-98 select-none`}
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4"/>
                  </Button>




              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}



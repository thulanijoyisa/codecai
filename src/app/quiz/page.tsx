//import GalleryCourseCard from "@/components/GalleryCourseCard";
//import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from "next/navigation";
import { db } from "@/db";
import QuizMeCard from "@/quize/quizdash/QuizMeCard";
import HistoryCard from "@/quize/quizdash/HistoryCard";
import HotTopicsCard from "@/quize/quizdash/HotTopicsCard";
import RecentActivityCard from "@/quize/quizdash/RecentActivityCard";

type Props = {};

export const metadata = {
  title: "Quiz Dashboard | My Quizzes",
  //description: "Quiz yourself on anything!",
};

const QuizDashPage = async (props: Props) => {
  const {getUser} = getKindeServerSession()
    const user = await getUser()
    
    //if(!user || !user.id) redirect('/')
/*
    const dbUser = await db.user.findFirst({
        where: {
          id: user.id
        }
      })
    
      if(!dbUser) redirect('/')*/

  return (
    <main className='mx-auto max-w-7xl md:p-10' >
     <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
     <h1 className='mb-3 font-bold text-5xl text-gray-900'>
          My Quizzes
        </h1>
        <Link className={buttonVariants({
          size: 'lg',
          className: 'mt-5'
         })} href='/quize'> 
         Create Quiz 
         </Link>
     </div>

     {/*<div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>*/}

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <QuizMeCard />
        <HistoryCard />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <HotTopicsCard />
        <RecentActivityCard />
      </div>


        {/*
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Pretty empty around here
          </h3>
          <p>Let&apos;s create your first quiz.</p>
        </div>
        */}
    </main>
    )
}

export default QuizDashPage;
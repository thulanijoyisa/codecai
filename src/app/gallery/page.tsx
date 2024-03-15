
import { buttonVariants } from "@/components/ui/button";
import GalleryCourseCard from "@/course/GalleryCourseCard";
import { db } from "@/db";
import { Ghost, Loader,  } from "lucide-react";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'

type Props = {};

export const metadata = {
  title: "Courses Dashboard | My Courses",
  //description: "Quiz yourself on anything!",
};

const GalleryPage = async (props: Props) => {

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id)
    redirect(`/`)
  
  const courses = await db.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });

  return (
    <main className='mx-auto max-w-7xl md:p-10' >
     <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
     <h1 className='mb-3 font-bold text-5xl text-gray-900'>
          My Courses
        </h1>
        <Link className={buttonVariants({
          size: 'lg',
          className: 'mt-5'
         })} href='/create'> 
         Create Course 
         </Link>
     </div>
      {/* display all user files */}
      {courses && courses?.length !== 0 ? (
     <div className="py-8 mx-auto max-w-7xl">
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
        {courses.map((course) => {
          return <GalleryCourseCard course={course} key={course.id} />;
        })}
      </div>
    </div>  
     ) : (
     <div className='mt-16 flex flex-col items-center gap-2'>
     <Ghost className='h-8 w-8 text-zinc-800' />
     <h3 className='font-semibold text-xl'>
      Pretty empty around here
     </h3>
     <p>Let&apos;s create your first course.</p>
     </div>
)}
    </main> 
    )
}

export default GalleryPage;
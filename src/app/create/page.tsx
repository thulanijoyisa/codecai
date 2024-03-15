import CreateCourseForm from "@/course/CreateCourseForm";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { InfoIcon } from "lucide-react";
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}

const CreatePage = async (props: Props) => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()
    
    if(!user || !user.id) redirect('/auth-callback?origin-dashboard')

    const dbUser = await db.user.findFirst({
        where: {
          id: user.id
        }
      })
    
      if(!dbUser) redirect('/auth-callback?origin=dashboard')


  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Create your course
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
       <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div>
          Enter in a course title, or what you want to learn about. Then enter a
          list of units, which are the specifics you want to learn. And our AI
          will generate a course for you!
        </div>
      </div>

      <CreateCourseForm />
    </div>
  )
}

export default CreatePage;
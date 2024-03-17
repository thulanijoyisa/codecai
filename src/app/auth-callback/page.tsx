import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { db } from "@/db";

const Page = async () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

 // const { data, error } = trpc.authCallback.useQuery(undefined);

 /* useEffect(() => { 
    if (data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    } else if (error?.data?.code === "UNAUTHORIZED") {
      console.log('error: ', error);
      router.push("/sign-in");
    }
  }, [data, error, router, origin]); */

  const {getUser} = getKindeServerSession()
  const user = await getUser()
  
  if(!user || !user.id) redirect('/auth-callback?dashboard')

  const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })
  
    if(!dbUser) redirect('/auth-callback?dashboard')

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page
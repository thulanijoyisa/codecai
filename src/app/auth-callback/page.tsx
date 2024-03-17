"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

  const { data, error, isLoading } = trpc.authCallback.useQuery()

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    } else if (error?.data?.code === "UNAUTHORIZED") {
      console.log('error: ', error);
      router.push("/sign-in");
    }
  }, [data, error, router, origin]); 

  // Render loading indicator while waiting for data
  if (isLoading) {
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
    );
  }

  // Handle error case
  if (error) {
    console.error('Error occurred during authentication:', error);
    // You can customize the error handling here
  }

  // If neither loading nor error, component is ready to render
  return null;
}

export default Page;
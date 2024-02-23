

import { trpc } from '@/app/_trpc/client'
import { ChevronLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import Messages from "./Messages"
import ChatInput from './ChatInput'

interface ChatWrapperProps {
  fileId: string

}

const ChatWrapper = async ({fileId }: ChatWrapperProps) => {
  
  /*  const { data, isLoading } =  trpc.getFileUploadStatus.useQuery(
      {
        fileId,
      },
      {
        refetchInterval: ( data ) => 
          data?.status === 'SUCCESS' ||
          data?.status === 'FAILED'
            ? false
            : 500,
      }
    )*/
    return (
        <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
         <div className='flex-1 flex justify-center items-center flex-col mb-28'>
            <Messages/>
         </div>
            <ChatInput/>
        </div>
    )
}

export default ChatWrapper
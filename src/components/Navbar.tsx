import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { buttonVariants } from './ui/button'
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'
import MobileNav from './MobileNav'
import UserAccountNav from './UserAccountNav'


const Navbar = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

    return (
      <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
        <MaxWidthWrapper>
          <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
            <Link
              href='/'
              className='flex z-40 font-semibold'>
              <span>Codecia.</span>
            </Link>
            <MobileNav isAuth={!!user} />
  
            <div className='hidden items-center space-x-4 sm:flex'>
             {!user ? 
              (<>
              <Link
                href='/pricing'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}>
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}>
                Sign in
              </LoginLink>
              <RegisterLink
                className={buttonVariants({
                  size: 'sm',
                })}>
                Get started{' '}
                <ArrowRight className='ml-1.5 h-5 w-5' />
              </RegisterLink>
              </>
             ): (
              <>
              <Link
                href='/dashboard'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}> 
                PDF Chats Dashboard
              </Link>
              <Link
                href='/gallery'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}>
                Courses Dashboard
              </Link>
              <Link
                href='/quiz'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}>
                Quizzes Dashboard
              </Link>
 
              <LogoutLink>Log out</LogoutLink>
 
            </>
             )}
              
            </div>
          </div>
        </MaxWidthWrapper>
      </nav>
    )
  }
  
  export default Navbar
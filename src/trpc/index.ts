import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';

const idSchema = z.object({ id: z.string() });
 
export const appRouter = router({
  authCallback: publicProcedure.query( async ()  => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    if(!user?.id || !user.email)
    throw new TRPCError({code: 'UNAUTHORIZED'})

    // check if the user is in the db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })

    if(!dbUser){
      //create user in db 
      await db.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      })
    }

    return {success: true}
  }),


getUserFiles: privateProcedure.query(async ({ ctx }) => {
  const { userId } = ctx

  return await db.file.findMany({
    where: {
      userId,
    },
  })
}),


createStripeSession: privateProcedure.mutation(
  async ({ ctx }) => {
    const { userId } = ctx

    const billingUrl = absoluteUrl('/dashboard/billing')

    if (!userId)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!dbUser)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    const subscriptionPlan =
      await getUserSubscriptionPlan()

    if (
      subscriptionPlan.isSubscribed &&
      dbUser.stripeCustomerId
    ) {
      const stripeSession =
        await stripe.billingPortal.sessions.create({
          customer: dbUser.stripeCustomerId,
          return_url: billingUrl,
        })

      return { url: stripeSession.url }
    }

    const stripeSession =
      await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ['card', 'paypal'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        line_items: [
          {
            price: PLANS.find(
              (plan) => plan.name === 'Pro'
            )?.price.priceIds.test,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
        },
      })

    return { url: stripeSession.url }
  }
),


getFileMessages: privateProcedure
.input(
  z.object({
    limit: z.number().min(1).max(100).nullish(),
    cursor: z.string().nullish(),
    fileId: z.string(),
  })
)
.query(async ({ ctx, input }) => {
  const { userId } = ctx
  const { fileId, cursor } = input
  const limit = input.limit ?? INFINITE_QUERY_LIMIT

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

  const messages = await db.message.findMany({
    take: limit + 1,
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
  })

  let nextCursor: typeof cursor | undefined = undefined
  if (messages.length > limit) {
    const nextItem = messages.pop()
    nextCursor = nextItem?.id
  }

  return {
    messages,
    nextCursor,
  }
}),

getFileUploadStatus: privateProcedure
.input(z.object({ fileId: z.string() }))
.query(async ({ input, ctx }) => {
  const file = await db.file.findFirst({
    where: {
      id: input.fileId,
      userId: ctx.userId,
    },
  })

  if (!file) return { status: 'PENDING' as const }

  return { status: file.uploadStatus }
}),

getFile: privateProcedure
.input(z.object({ key: z.string() }))
.mutation(async ({ ctx, input }) => {
  const { userId } = ctx

  const file = await db.file.findFirst({
    where: {
      key: input.key,
      userId,
    },
  })

  if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

  return file
}),
///////////////////////////////// Course\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
getUserCourses: privateProcedure.query(async () => {
  return await db.course.findMany({
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });
}),

deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      await db.file.delete({
        where: {
          id: input.id,
        },
      })

      return file
    }),

  //get all users
  getAll: publicProcedure.query(({ ctx }) => {
    return db.course.findMany();
  }),

  //get user by id
  getOne: publicProcedure
    .input(idSchema)
    .query(({ input, ctx }) => {
      return db.course.findUnique({
        where: idSchema.parse(input),
      });
    }),

    
    //delete course
    deleteCourse: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id } = input;
  
      // Find the course
      const course = await db.course.findFirst({
        where: {
          id,
        },
        include: {
          units: {
            include: {
              chapters: true,
             // questions: true,
            },
          },
        },
      });
  
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
  
      try {
        // Delete all questions associated with chapters in all units of the course
        await db.question.deleteMany({
          where: {
            chapter: {
              unit: {
                courseId: course.id,
              },
            },
          },
        });
  
        // Delete all chapters in all units of the course
        await db.chapter.deleteMany({
          where: {
            unit: {
              courseId: course.id,
            },
          },
        });
  
        // Delete all units of the course
        await db.unit.deleteMany({
          where: {
            courseId: course.id,
          },
        });
  
        // Delete the course itself
        await db.course.delete({
          where: {
            id: course.id,
          },
        });
  
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "PARSE_ERROR", message: "Error deleting course" });
      }
    }),

});
  

export type AppRouter = typeof appRouter;
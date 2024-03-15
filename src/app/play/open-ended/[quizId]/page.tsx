
import { db } from '@/db';
import OpenEnded from '@/quize/OpenEnded';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    quizId: string;
  };
};

const OpenEndedPage = async ({ params: { quizId } }: Props) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if (!userId)
      return new Response('Unauthorized', { status: 401 })

  const quiz = await db.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      quizQuestions: {
        select: {
          id: true,
          question: true,
          answer: true,
        },
      },
    },
  });
  if (!quiz || quiz.quizType === "mcq") {
    return redirect("/quiz");
  }
  return <OpenEnded quiz={quiz}  />;
};

export default OpenEndedPage;
import { db } from '@/db';
import MCQ from '@/quize/MCQ';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    quizId: string;
  };
};

const MCQPage = async ({ params: { quizId } }: Props) => {
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
          options: true,
        },
      },
    },
  });
  if (!quiz || quiz.quizType === "open_ended") {
    return redirect("/quiz");
  }
  return <MCQ quiz={quiz} />;
};

export default MCQPage;
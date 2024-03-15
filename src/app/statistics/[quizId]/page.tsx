import { buttonVariants } from "@/components/ui/button";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db } from "@/db";
import { redirect } from "next/navigation";
import React from "react";
import ResultsCard from "@/quize/statistics/ResultsCard";
import AccuracyCard from "@/quize/statistics/AccuracyCard";
import TimeTakenCard from "@/quize/statistics/TimeTakenCard";
import QuestionsList from "@/quize/statistics/QuestionsList";


type Props = {
  params: {
    quizId: string;
  };
};

const Statistics = async ({ params: { quizId } }: Props) => {

    const {getUser} = getKindeServerSession()
    const user = await getUser()
    
    if(!user || !user.id) redirect('/')

    const dbUser = await db.user.findFirst({
        where: {
          id: user.id
        }
      })
    
      if(!dbUser) redirect('/')

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { quizQuestions: true },
  });
  if (!quiz) {
    return redirect("/");
  }

  let accuracy: number = 0;

  if (quiz.quizType === "mcq") {
    let totalCorrect = quiz.quizQuestions.reduce((acc, question) => {
      if (question.isCorrect) {
        return acc + 1;
      }
      return acc;
    }, 0);
    accuracy = (totalCorrect / quiz.quizQuestions.length) * 100;
  } else if (quiz.quizType === "open_ended") {
    let totalPercentage = quiz.quizQuestions.reduce((acc, question) => {
      return acc + (question.percentageCorrect ?? 0);
    }, 0);
    accuracy = totalPercentage / quiz.quizQuestions.length;
  }
  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-2">
            <Link href="/quiz" className={buttonVariants()}>
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(quiz.timeEnded ?? 0)}
            timeStarted={new Date(quiz.timeStarted ?? 0)}
          />
        </div>
        <QuestionsList quizQuestions={quiz.quizQuestions} />
      </div>
    </>
  );
};

export default Statistics;
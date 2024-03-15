import React from "react";
import { redirect } from "next/navigation";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import QuizCreation from "@/quize/form/QuizCreation";


export const metadata = {
  title: "Quiz | Quizzzy",
  description: "Quiz yourself on anything!",
};

interface Props {
  searchParams: {
    topic?: string;
  };
}

const Quiz = async ({ searchParams }: Props) => {

  return <QuizCreation topic={searchParams.topic ?? ""} />;
};

export default Quiz;
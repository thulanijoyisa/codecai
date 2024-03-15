import { db } from "@/db";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import axios from "axios";
import { NextResponse } from "next/server";
import { ZodError } from "zod";


/// /api/quiz

export async function POST(req: Request, res: Response) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if (!userId)
      return new Response('Unauthorized', { status: 401 })

    const body = await req.json();

    const {amount,topic,type} = quizCreationSchema.parse(body)
    const quiz = await db.quiz.create({
      data: {
        quizType: type,
        timeStarted: new Date(),
        userId: userId,
        topic
      }
    })
    await db.topic_count.upsert({
      where: {
        topic,
      },
      create: {
        topic,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });

    const {data} = await axios.post('http://localhost:3000/api/questions',{
      amount,
      topic,
      type,
    });

    if(type === 'mcq'){
      type mcqQuestion = {
        question: string,
        answer: string,
        option1: string,
        option2: string,
        option3: string,

      }
      let manyData = data.questions.map((question: mcqQuestion) =>{
        let options = [question.answer, question.option1, question.option2,question.option3]
        options = options.sort(() => Math.random() -0.5)
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          quizId: quiz.id,
          quizType: 'mcq',

        }
      })
       await db.quizquestion.createMany({
        data: manyData
       })
    }else if(type === 'open_ended' ){
      type openQuestion = {
        question: string;
        answer: string;
      };
      let manyData =  data.questions.map((question: openQuestion) => {
         return{
          question: question.question,
          answer: question.answer,
          quizId: quiz.id,
          quizType: 'open_ended',
         } 
      })
      await db.quizquestion.createMany({
        data: manyData
      })
    }
    return NextResponse.json({quizId: quiz.id})
    
  } catch (error) {
    if(error instanceof ZodError){
      return NextResponse.json({error: error.issues},{status: 400})
    }
    return NextResponse.json({error: "Something went wrong"}, {status:500})
  }
} 

export async function GET(req: Request, res: Response) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if (!userId)
      return new Response('Unauthorized', { status: 401 })

    const url = new URL(req.url);
    const quizId = url.searchParams.get("quizId");
    if (!quizId) {
      return NextResponse.json(
        { error: "You must provide a quiz id." },
        {
          status: 400,
        }
      );
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        quizQuestions: true,
      },
    });
    if (!quiz) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { quiz },
      {
        status: 400,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      {
        status: 500,
      }
    );
  }
}
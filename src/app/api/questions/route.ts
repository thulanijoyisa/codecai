import { strict_output } from "@/lib/gpt";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server"
import { ZodError } from "zod";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/*export const GET = async (re: Request, res: Response) => {
  return NextResponse.json({
    hello: "world",
  })
};*/

//POST/ /api/questions
export const POST = async (req: Request, res: Response) => {
  try {
    /*const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if (!userId)
      return new Response('Unauthorized', { status: 401 })*/

    const body = await req.json()
    const {amount, topic, type} = quizCreationSchema.parse(body)
    let questions: any; 
    if(type === 'open_ended'){
      questions = await strict_output(
        'You are a helpful AI that is able to generate a pair of question and answers, the length of each answer should not be more than 15 words, store all the pairs of answers and questions in a JSON array',
        new Array(amount).fill(
          `You are to generate a random hard open-ended questions about ${topic}`
        ),
        {
          question: 'question',
          answer: 'answer with max length of 15 words',
        }
        )
    } else if(type === 'mcq'){
      questions = await strict_output(
        'You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array',
        new Array(amount).fill(
          `You are to generate a random hard mcq question about ${topic}`
        ),
        {
          question: 'question',
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      )
    }
    return NextResponse.json({
      questions
    },{
      status: 200
    })
    
  } catch (error) {
    if(error instanceof ZodError){
      return NextResponse.json({
        error: error.issues
      },{
        status:400,
      })
    }
  }
 
};
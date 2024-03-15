
import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/db";
import stringSimilarity from 'string-similarity';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);
    const question = await db.quizquestion.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }
    await db.quizquestion.update({
      where: { id: questionId },
      data: { userAnswer: userInput },
    });
    if (question.quizType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();
      await db.quizquestion.update({
        where: { id: questionId },
        data: { isCorrect },
      });
      return NextResponse.json({
        isCorrect,
      });
    } else if (question.quizType === "open_ended") {
      let percentageSimilar = stringSimilarity.compareTwoStrings(
        question.answer.toLowerCase().trim(),
        userInput.toLowerCase().trim()
      );
      percentageSimilar = Math.round(percentageSimilar * 100);
      await db.quizquestion.update({
        where: { id: questionId },
        data: { percentageCorrect: percentageSimilar },
      });
      return NextResponse.json({
        percentageSimilar,
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
}
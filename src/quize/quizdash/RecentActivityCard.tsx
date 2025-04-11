import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db } from "@/db";
import HistoryComponent from "../HistoryComponent";

type Props = {}; 

const RecentActivityCard = async (props: Props) => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

      const quiz_count = await db.quiz.count({
        where: {
          userId: user?.id,
        },
      })

      return (
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              <Link href="/history">Recent Activity</Link>
            </CardTitle>
            <CardDescription>
              You have played a total of {quiz_count} quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[580px] overflow-scroll">
            <HistoryComponent limit={10} userId={user!.id} />
          </CardContent>
        </Card>
      );
    };
    
    export default RecentActivityCard;
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LucideLayoutDashboard } from "lucide-react";
import HistoryComponent from "@/quize/HistoryComponent";
import { db } from "@/db";

type Props = {};

const History = async (props: Props) => {
  const {getUser} = getKindeServerSession()
  const user = await getUser()
  
  if (!user || !user.id)
    redirect(`/`)
  
 /* if(!user || !user.id) redirect('/auth-callback?origin-dashboard')

  const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })
  
    if(!dbUser) redirect('/auth-callback?origin=dashboard')*/

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[400px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">History</CardTitle>
            <Link className={buttonVariants()} href="/quiz">
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-scroll">
          <HistoryComponent limit={100} userId={user!.id} />
        </CardContent>
      </Card>
    </div> 
  );
};

export default History;

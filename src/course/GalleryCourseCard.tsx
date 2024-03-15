"use client"

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/db";
import { Chapter, Course, Prisma, Unit } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ghost, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";


type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const GalleryCourseCard = ({ course }: Props) => { 

    const utils = trpc.useContext()
    const [currentlyDeletingCourse, setCurrentlyDeletingCourse] = useState<string | null>(null)
    
    const { mutate: deleteCourse } =
         trpc.deleteCourse.useMutation({
         onSuccess: () => {
             utils.getUserFiles.invalidate()
             toast({
              title: "Success",
              description: "Course successfully deleted",
            });
         },
         onMutate({ id }) {
          setCurrentlyDeletingCourse(id)
         },
         onSettled() {
          setCurrentlyDeletingCourse(null)
         },
      })
         
  return (
    <>
    <div className="border rounded-lg border-secondary flex flex-col">
    <Card className="col-span-4 lg:col-span-3">
      <div className="relative flex-shrink-0">
      
        <Link href={`/course/${course.id}/0/0`} className="relative block w-full">
          <Image
            src={course.image || ""}
            className="object-cover w-full h-40 rounded-t-lg"
            width={300}
            height={300}
            priority
            alt="picture of the course"
          />
          <span className="absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-2 left-2 right-2">
            {course.name}
          </span>
        </Link>

        <Button
          onClick={() =>
            deleteCourse({ id: course.id } )
          }
          size="sm"
          className="absolute bottom-2 right-2"
          variant="destructive"
        >
          {currentlyDeletingCourse === course.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-sm text-secondary-foreground/60">Units</h4>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {course.units.map((unit, unitIndex) => (
            <Link
              href={`/course/${course.id}/${unitIndex}/0`}
              key={unit.id}
              className="block underline w-fit"
            >
              {unit.name}
            </Link>
          ))}
        </div>
      </div>
      </Card>
    </div>
    </>
  );
};

export default GalleryCourseCard;
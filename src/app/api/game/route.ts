import { getAuthSession } from "@/lib/nextauth";
import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schema/form/quiz";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import axios from 'axios'

export async function POST(req:Request,Res:Response){
    try {
        const session = await getAuthSession()
        if(!session?.user){
            return NextResponse.json(
                {
                    error:'you must be logged in',
                },
                {
                    status:400
                }
            )
        }
        const body = await req.json()
        const {amount,topic,type} = quizCreationSchema.parse(body)
        const game = await prisma.game.create({
            data :{
                gameType:type,
                timeStarted:new Date(),
                userId: `${session.user.id}`,
                topic
            }
        })
        await prisma.topic_count.upsert({
            where:{
                topic
            },
            create:{
                topic,
                count: 1
            },
            update:{
                count:{
                    increment:1,
                }
            }
        })
        const {data} = await axios.post(`${process.env.API_URL}/api/questions`,{
            amount,
            topic,
            type
        });
        if(type === 'mcq'){
            type mcqQuestion = {
                question:string;
                answer : string;
                option1: string;
                option2: string;
                option3: string;
            }

            const manyData = data.questions.map((question:mcqQuestion)=>{
                const options = [
                    question.option1,
                    question.option2,
                    question.option3,
                    question.answer,
                ].sort(()=>Math.random()-0.5);
                const finalOption=JSON.stringify(options)
                const finalOption2=JSON.parse(finalOption)
                console.log(finalOption2)
                return{
                    question:question.question,
                    answer:question.answer,
                    options:finalOption2,
                    gameId:game.id,
                    questionType:'mcq'
                }
            })


            await prisma.question.createMany({
                data:manyData,
            });
        } else if (type === "open_ended"){
            type openQuestion = {
                question : string;
                answer:string;
            };
            const manyData = data.questions.map((question:openQuestion)=>{
                return{
                    question : question.question,
                    answer:question.answer,
                    options:'',
                    gameId:game.id,
                    questionType:'open_ended',
                }
            })
            await prisma.question.createMany({
                data: manyData
            })
        }
        return NextResponse.json({gameId:game.id},{status:200})
    } catch (error) {
        if(error instanceof ZodError){
            return NextResponse.json({error:error.issues},{status:400})
        }
    }
    return NextResponse.json(
    {
        error:'something went wrong'
    },
    {
        status:500
    }
    )
}
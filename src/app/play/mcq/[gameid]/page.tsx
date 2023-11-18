import MCQ from '@/components/MCQ';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/nextauth';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    params:{
        gameid:string
    };
};


const MCQPage = async ({params:{gameid}}: Props) => {
    const session = await getAuthSession()
    if(!session?.user){
        return redirect('/')
    }
    const game = await prisma.game.findUnique({
        where:{
            id:gameid
        },
        include:{
            questions:{
                select:{
                    id:true,
                    question:true,
                    options:true,
                }
            }
        },
    });
    if(!game || game.gameType !== 'mcq'){
        redirect('/quiz')
    }
  return <MCQ game={game}/>
  
}

export default MCQPage
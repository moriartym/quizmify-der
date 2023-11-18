import OpenEnded from '@/components/OpenEnded';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/nextauth';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    params:{
        gameid:string
    };
};


const OpenEndedPage = async ({params:{gameid}}: Props) => {
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
                    answer:true
                }
            }
        },
    });
    if(!game || game.gameType !== 'open_ended'){
        redirect('/quiz')
    }
  return <OpenEnded game={game}/>
  
}

export default OpenEndedPage
import { getAuthSession } from '@/lib/nextauth';
import React from 'react'
import {redirect} from 'next/navigation'
import QuizCreation from '@/components/QuizCreation';

type Props = {
  searchParams:{
    topic?: string
  }
}

export const metadata = {
  title:"Quiz | Quizmify"  
};

const page = async ({searchParams}: Props) => {
    const session = await getAuthSession()
    if(!session?.user){
        return redirect('/')
    }
    return <QuizCreation topicParam={searchParams.topic ?? ''}/>
}

export default page
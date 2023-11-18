'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {useForm} from 'react-hook-form'
import { quizCreationSchema } from '@/schema/form/quiz'
import { z } from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { BookOpen, CopyCheck } from 'lucide-react'
import { Separator } from './ui/separator'
import {useMutation} from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import LoadingQuestion from './LoadingQuestion'

type Props = {
  topicParam:string
}

type Input = z.infer<typeof quizCreationSchema>

const QuizCreation = ({topicParam}: Props) => {
  const [showLoader,setShowLoader] = useState(false)
  const router = useRouter()
  const [finished,setFinished] = useState(false)
  const {mutate:getQuestion} = useMutation({
    mutationFn: async ({amount,topic,type} : Input)=>{
      const response = await axios.post('/api/game',{
        amount,
        topic,
        type,
      })
      return response.data
    }
  })

    const form = useForm<Input>({
        resolver: zodResolver(quizCreationSchema),
        defaultValues : {
            amount:3,
            topic:topicParam,
            type:"open_ended"
        }
    });

    const [loading, setLoading] = useState(false);
    function onSubmit(input:Input){
      setShowLoader(true)
      setLoading(true)
        getQuestion({
          amount: input.amount,
          topic: input.topic,
          type: input.type,
        },{
          onSuccess:({gameId}) => {
            setLoading(false)
            setFinished(true)
            setTimeout(() => {
              if(form.getValues('type') === 'open_ended'){
                router.push(`/play/open_ended/${gameId}`)
              } else {
                router.push(`/play/mcq/${gameId}`)
              }
            }, 1000);
          },
          onError:()=>{
            setShowLoader(false)
          }
        })
    }

    form.watch()

    if(showLoader){
      return <LoadingQuestion finished={finished}/>
    }
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Card>
            <CardHeader>
                <CardTitle className='text-2xl font-bold'>
                    Quiz Creation
                </CardTitle>
                <CardDescription>
                    Choose a topic
                </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter a topic..." {...field} />
              </FormControl>
              <FormDescription>
                Please provide a topic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Question</FormLabel>
              <FormControl>
              <Input placeholder="Enter an amount..." {...field} onChange={e => {
                if (!isNaN(parseFloat(e.target.value))) {
                  form.setValue('amount', parseInt(String(e.target.value)));
                }
              }} 
              type='number' 
              min={1} 
              max={10} /> 
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
            <Button type='button' className='w-1/2 rounded-none rounded-l-lg'            onClick={()=>{
                form.setValue('type','mcq')
            }} 
            variant={form.getValues('type') === 'mcq' ?'default':'secondary'}>
                <CopyCheck className='h-4 w-4 mr-2'/>
                Multiple Choice
            </Button>
            <Separator orientation='vertical'/>
            <Button type='button' className='w-1/2 rounded-none rounded-r-lg' 
            onClick={()=>{
                form.setValue('type','open_ended')
            }}
            variant={form.getValues('type') === 'open_ended' ?'default':'secondary'} >
                <BookOpen className='h-4 w-4 mr-2'/>
                Open Ended
            </Button>
        </div>
        <Button disabled={loading} type="submit">Submit</Button>
      </form>
    </Form>

            </CardContent>
        </Card>
    </div>
  )
}

export default QuizCreation
"use client"

import React from 'react'
import {SessionProvider} from "next-auth/react"
import { ThemeProvider as NextThemesProvider, ThemeProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
 import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
 const queryClient = new QueryClient()
const Provider = ({ children, ...props }: ThemeProviderProps) => {
    return(
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider attribute='class' defaultTheme='system' enableSystem{...props}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </NextThemesProvider>
        </QueryClientProvider>
    )
}

export default Provider
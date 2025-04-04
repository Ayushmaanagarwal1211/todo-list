"use client"
import React, { ReactNode } from 'react'
import {createContext, useState} from 'react'
interface LoaderContextType {
    setLoader: (state: boolean) => void;
  }
export const Context = createContext<LoaderContextType | undefined>(undefined)

export default function LoaderContext({children}: { children: ReactNode }) {
    const [loader,setLoader] = useState(false)
  return (
        <Context.Provider value={{setLoader}} >
            {children}
            {
                loader &&   <div className="fixed inset-0 bg-black w-[100vw] z-[10000] h-[100vh] opacity-50 flex justify-center items-center ">
                <div className="w-16 h-16 border-4 border-t-4 botder-t-[2px] border-b-white border-solid  border-t-red-700 rounded-full animate-spin"></div>
              </div>
            }
        </Context.Provider>
  )
}

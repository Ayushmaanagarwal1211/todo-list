"use client"
import React from 'react'
import dynamic from 'next/dynamic'
const Dialog = dynamic(()=>import("./Dialog"),{ssr:false})
export default function AddTask() {
  return (
    <div><Dialog name={"Add Task"} isEdit={false}/></div>
  )
}

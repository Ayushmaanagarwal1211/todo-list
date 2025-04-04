import React from 'react'
import dynamic from 'next/dynamic';
const DataTable = dynamic(() => import("./DataTable"));
import { auth } from '@clerk/nextjs/server'
import {columns} from './Column'

export default async function UserTodos() {
    const {userId,getToken} = await auth()
    if (!userId) {
        return <div>Please log in to view your todos.</div>;
    }
    const token = await getToken()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todo`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`
    },
      next: { tags: ["todos"] }, 
    });
    let data = await res.json()
    data=  data.todos
   return (
    <div> <DataTable data={data} columns={columns} /></div>
  )
}

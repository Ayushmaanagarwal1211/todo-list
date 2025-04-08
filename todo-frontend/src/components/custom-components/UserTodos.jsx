import React from 'react'
import { auth } from '@clerk/nextjs/server'
import dynamic from 'next/dynamic';
const TodosWrapper = dynamic(() => import("./TodosWrapper"));
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
    const tags = Array.from(
      new Set(data.todos.flatMap((item) => item.tags || []))
    );
   return (
    <div><TodosWrapper data={data} tags={tags} token={token}/> </div>
  )
}

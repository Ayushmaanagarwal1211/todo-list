
import React from 'react'
import dynamic from 'next/dynamic'
const UserTodos = dynamic(() => import("../../components/UserTodos"));
const AddTask = dynamic(() => import("../../components/AddTask"));
export default function page() {

  return (
    <div> <AddTask/> <UserTodos/> </div>
  )
}

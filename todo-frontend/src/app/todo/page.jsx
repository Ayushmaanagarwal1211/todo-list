
import React from 'react'
import dynamic from 'next/dynamic'
const UserTodos = dynamic(() => import("../../components/custom-components/UserTodos"));
const AddTask = dynamic(() => import("../../components/custom-components/AddTask"));
export default function page() {

  return (
    <div> <AddTask/> <UserTodos/> </div>
  )
}

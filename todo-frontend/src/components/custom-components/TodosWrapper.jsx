"use client"
import React, {  useEffect } from 'react'
import DataTable from '../DataTable';
import {columns} from '../Column'
import { useDispatch,useSelector } from 'react-redux';
import { setLoader ,setTasks} from '../../slice/todoSlice';





export default function TodosWrapper({data,tags}) {
    const tasks = useSelector((state) => state.todo.tasks);
    const dispatch = useDispatch()
    useEffect(()=>{
        dispatch(setTasks(data.todos))
    },[data.todos])

  return (
    <div><DataTable 
    data={tasks} 
    tags={tags} 
    totalPages={data.totalPages}
    columns={columns} /></div>
  )
}

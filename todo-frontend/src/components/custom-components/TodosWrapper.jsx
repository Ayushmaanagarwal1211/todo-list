"use client"
import React, {  useEffect } from 'react'
const DataTable = dynamic(() => import('../DataTable'), {
  ssr: false,
});
import {columns} from '../Column'
import { useDispatch,useSelector } from 'react-redux';
import { setCurrentPage, setTasks, setTotalPages} from '../../slice/todoSlice';
import dynamic from 'next/dynamic';

export default function TodosWrapper({data}) {
    const tasks = useSelector((state) => state.todo.tasks);
    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(setTasks(data.todos))
        dispatch(setCurrentPage(data.currentPage))
        dispatch(setTotalPages(data.totalPages))
    },[data.todos])

  return (
    <div><DataTable 
    data={tasks} 
    columns={columns} /></div>
  )
}

"use client"
import React, {  useEffect } from 'react'
import DataTable from '../DataTable';
import {columns} from '../Column'
import { toast } from 'react-toastify';
import { useDispatch,useSelector } from 'react-redux';
import { setLoader ,setTasks} from '../../slice/todoSlice';





export default function TodosWrapper({data,tags}) {
    const tasks = useSelector((state) => state.todo.tasks);
    // console.log(tasks)
  const dispatch = useDispatch()
    useEffect(()=>{
        dispatch(setTasks(data.todos))
    },[data.todos])

    // const fetchPaginatedData =async (pageNumber, filters = {}) => {
    //   setLoader(true);
    //   try {
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todo?page=${pageNumber}`, {
    //       method: 'GET',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'filters': JSON.stringify(filters)
    //       }
    //     });
        
    //     const data = await response.json();
    //     setTasks(data.todos);
    //     setCurrentPage(data.currentPage)
    //   } catch (err) {
    //     toast.error(`Failed to fetch data : ${err}`)
    //   } finally {
    //     setLoader(false);
    //   }
    // };
  return (
    <div><DataTable 
    data={tasks} 
    tags={tags} 
    totalPages={data.totalPages}
    columns={columns} /></div>
  )
}

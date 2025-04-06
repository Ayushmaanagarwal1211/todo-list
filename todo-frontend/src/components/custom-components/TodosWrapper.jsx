"use client"
import React, { useContext, useEffect } from 'react'
import dynamic from 'next/dynamic';
import DataTable from '../DataTable';
// const DataTable = dynamic(() => import("./DataTable"));
import {columns} from '../Column'
import { Context } from '@/context/LoaderContext';

export default function TodosWrapper({todos}) {
    const {setLoader} = useContext(Context)
    useEffect(()=>{
        setLoader(false)
    },[todos])

    
  return (
    <div><DataTable data={todos} columns={columns} /></div>
  )
}

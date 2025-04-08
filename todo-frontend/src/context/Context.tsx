"use client"
import { useAuth } from '@clerk/clerk-react';
import React, { ReactNode, useEffect } from 'react'
import {createContext, useState} from 'react'
import { toast } from 'react-toastify';
interface FiltersType {
  from: string | Date;
  to: string |  Date;
  title: string;
  categories: string[];
  tags: string[];
}

interface ContextType {
  setLoader: (state: boolean) => void;
  tasks: any[]; 
  setTasks: (task : []) => void,
  currentPage : number,
  setCurrentPage : (pageNumber : number)=> void,
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  fetchPaginatedData: (pageNumber: number, filters?: Partial<FiltersType>) => Promise<void>;

}
export const Context = createContext<ContextType | undefined>(undefined)

export default function AppContext({children}: { children: ReactNode }) {
    const [loader,setLoader] = useState(false)
    const [tasks,setTasks] = useState([])
    const [currentPage,setCurrentPage] = useState<number>(1)
    const [filters, setFilters] = useState<FiltersType>({
      from: "",
      to: "",
      title: "",
      categories: [],
      tags: [],
    });
    const { getToken } = useAuth();

    const fetchPaginatedData = async () => {
      console.log("CALLLIINNGG",filters)
      setLoader(true);
      try {
        const token  = await getToken();
 
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/todo?page=${currentPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              filters: JSON.stringify(filters),
            },
          }
        );
  
        const data = await response.json();
        setTasks(data.todos);
        setCurrentPage(data.currentPage);
      } catch (err) {
        toast.error(`Failed to fetch data : ${err}`);
      } finally {
        setLoader(false);
      }
    };


    useEffect(()=>{
        fetchPaginatedData()
    
    },[filters, currentPage])
  return (
        <Context.Provider value={{setLoader,tasks , setTasks,currentPage,setCurrentPage,filters,setFilters,fetchPaginatedData}} >
            {children}
            {
                loader &&   <div className="fixed inset-0 bg-black w-[100vw] z-[10000] h-[100vh] opacity-50 flex justify-center items-center ">
                <div className="w-16 h-16 border-4 border-t-4 botder-t-[2px] border-b-white border-solid  border-t-red-700 rounded-full animate-spin"></div>
              </div>
            }
        </Context.Provider>
  )
}

"use client";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoader, fetchPaginatedData } from "@/slice/todoSlice";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

export default function useApiRequest() {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  return async (url, method, body, headers) => {
    const token = await getToken()
    try {
        dispatch(setLoader(true));
      await axios({
        url,
        method,
        data: body,
        headers: {
          "Content-Type": "application/json",'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
          ...headers,
        },
      });
      dispatch(fetchPaginatedData(token));
    } catch (err) {
      toast.error(`API Request Failed : ${err}`)
      setLoader(false)
    } 
  };
}

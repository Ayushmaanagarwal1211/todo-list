// hooks/useApiRequest.ts
"use client";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoader, fetchPaginatedData } from "@/slice/todoSlice";
import { useAuth } from "@clerk/clerk-react";

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
          "Content-Type": "application/json",
          ...headers,
        },
      });
      dispatch(fetchPaginatedData(token));
    } catch (err) {
      console.error("API Request failed:", err);
    } finally {
      dispatch(setLoader(false));
    }
  };
}

"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";




// Async thunk to fetch tasks
export const fetchPaginatedData = createAsyncThunk(
  "todo/fetchPaginatedData",
  async (token, { getState, rejectWithValue }) => {
    const state = getState();
    const { currentPage, filters } = state.todo;
    console.log(token,"TOKLEN")
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/todo?page=${currentPage}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                // "Content-Type": "application/json",
                "filters": JSON.stringify(filters),
              },
            }
          );
    
          return response.data;
    } catch (err) {
      toast.error(`Failed to fetch data: ${err}`);
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
    loader: false,
    tasks: [],
    currentPage: 1,
    filters: {
      from: "",
      to: "",
      title: "",
      categories: [],
      tags: [],
    },
  };
export const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    setLoader: (state, action) => {
      state.loader = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaginatedData.pending, (state) => {
        state.loader = true;
      })
      .addCase(fetchPaginatedData.fulfilled, (state, action) => {
        state.loader = false;
        state.tasks = action.payload.todos;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchPaginatedData.rejected, (state) => {
        state.loader = false;
      });
  },
});

export const { setLoader, setTasks, setCurrentPage, setFilters } = todoSlice.actions;
export default todoSlice.reducer;

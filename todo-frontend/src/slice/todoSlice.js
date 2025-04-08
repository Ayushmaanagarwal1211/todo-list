"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const fetchPaginatedData = createAsyncThunk(
  "todo/fetchPaginatedData",
  async (token, { getState, rejectWithValue }) => {
    const state = getState();
    const { currentPage, filters } = state.todo;
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/todo?page=${currentPage}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "filters": JSON.stringify(filters),
              },
            }
          );


          const tags = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/todo/tags/all`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

          return {todos : response.data , tags : tags.data};
    } catch (err) {
      toast.error(`Failed to fetch data: ${err}`);
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
    loader: false,
    tasks: [],
    tags : [],
    totalPages : 1,
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
        
          state.tasks = action.payload.todos.todos;
          state.loader = false;
          state.totalPages = action.payload.todos.totalPages
          state.tags  = action.payload.tags.tags
        state.currentPage = action.payload.todos.currentPage;
      })
      .addCase(fetchPaginatedData.rejected, (state) => {
        state.loader = false;
      });
  },
});

export const { setLoader, setTasks, setCurrentPage, setFilters } = todoSlice.actions;
export default todoSlice.reducer;

"use client";

import { ColumnDef } from "@tanstack/react-table";
import {  useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Button } from "./ui/button";
import useApiRequest from "./custom-components/apiRequest"; 
import { toast } from "react-toastify";

const Dialog = dynamic(() => import("./Dialog"), { ssr: false });

export type Todo = {
  title: string;
  description: string;
  status: "pending" | "success";
  category: string;
  deadline: Date;
  tags : string[];
  _id: string;
};

export const columns: ColumnDef<Todo>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status", cell: StatusCell },
  { accessorKey: "deadline", header: "Deadline", cell: DeadlineCell },
  { id: "actions", header: "Actions", cell: ActionsCell },
  {
    accessorKey: "tag",
    header: "Tags",
    cell: ({ row }) => {
      const tags: string[] = row.original.tags;
      if (!tags || tags.length === 0) return <span className="text-muted-foreground">No tags</span>;
  
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px] overflow-y-auto">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  
];

function ActionsCell({ row }: { row: { original: Todo } }) {
  // const context = useContext(Context);
  const { getToken } = useAuth();
  const makeRequest = useApiRequest()
  // if (!context) throw new Error("Context not available");

  // const { setLoader } = context;

  const handleDeleteTask = async () => {
    try {
      // setLoader(true);
      const token = await getToken();
      await makeRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/todo/${row.original._id}`,
        "DELETE",
        {},
        { Authorization: `Bearer ${token}` }
      );
      toast.success("Task Deleted Successfully")
    } catch (error) {
      // setLoader(false)
      toast.error(`Error deleting task: ${error}`)
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog isEdit={true} task={row.original} name="Edit Task" key={row.original._id} />
      <Button onClick={handleDeleteTask}>Delete Task</Button>
    </div>
  );
}

function StatusCell({ row }: { row: { original: Todo } }) {
  const { getToken } = useAuth();
  // const context = useContext(Context);

  // if (!context) throw new Error("Context not available");

  // const { setLoader } = context;
  const id = row.original._id;
  const status: "pending" | "success" = row.original.status;
  const makeRequest = useApiRequest()

  const handleStatusChange = async () => {
    try {
      // setLoader(true);
      const token = await getToken();
      await makeRequest(
       `${process.env.NEXT_PUBLIC_API_URL}/todo/${id}`,
        "PUT",
        { status: status === "pending" ? "success" : "pending" },
        { Authorization: `Bearer ${token}` }
      );
      // dispatch(fetchPaginatedData())
    } catch (error) {
      toast.error(`Error Updating Task ${error}`)
    }
  }

  return (
    <div className="font-medium">
      <Checkbox
        title="Change status"
        aria-label="Toggle task status"
        id={`status-${id}`}
        checked={status === "success"}
        onCheckedChange={handleStatusChange}
      />
    </div>
  );
}

function DeadlineCell({ row }: { row: { original: Todo } }) {
  const deadline = row.original.deadline;
  const formattedDate = useMemo(
    () => (deadline ? format(new Date(deadline), "PPP") : "N/A"),
    [deadline]
  );

  return <div >{formattedDate}</div>;
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useContext, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { Context } from "@/context/LoaderContext";
import { format } from "date-fns";
import { Button } from "./ui/button";
import apiRequest from "./apiRequest"; // Ensure correct function import

const Dialog = dynamic(() => import("./Dialog"), { ssr: false });

export type Todo = {
  title: string;
  description: string;
  status: "pending" | "success";
  category: string;
  deadline: Date;
  _id: string;
};

export const columns: ColumnDef<Todo>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status", cell: StatusCell },
  { accessorKey: "deadline", header: "Deadline", cell: DeadlineCell },
  { id: "actions", header: "Actions", cell: ActionsCell },
];

function ActionsCell({ row }: { row: { original: Todo } }) {
  const context = useContext(Context);
  const { getToken } = useAuth();
  
  if (!context) throw new Error("Context not available");

  const { setLoader } = context;

  const handleDeleteTask = useCallback(async () => {
    try {
      setLoader(true);
      const token = await getToken();
      await apiRequest(
        `http://localhost:5000/todo/${row.original._id}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${token}` }
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoader(false);
    }
  }, [getToken, row.original._id, setLoader]);

  return (
    <div className="flex gap-2">
      <Dialog isEdit={true} task={row.original} name="Edit Task" key={row.original._id} />
      <Button onClick={handleDeleteTask}>Delete Task</Button>
    </div>
  );
}

function StatusCell({ row }: { row: { original: Todo } }) {
  const { getToken } = useAuth();
  const context = useContext(Context);

  if (!context) throw new Error("Context not available");

  const { setLoader } = context;
  const id = row.original._id;
  const status: "pending" | "success" = row.original.status;

  const handleStatusChange = useCallback(async () => {
    try {
      setLoader(true);
      const token = await getToken();
      await apiRequest(
        `http://localhost:5000/todo/${id}`,
        "PUT",
        { status: status === "pending" ? "success" : "pending" },
        { Authorization: `Bearer ${token}` }
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoader(false);
    }
  }, [getToken, id, setLoader, status]);

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

  return <div className="font-medium">{formattedDate}</div>;
}

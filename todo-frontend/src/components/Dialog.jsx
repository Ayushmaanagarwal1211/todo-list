"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
const Dialog = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.Dialog),{ssr : false});
const DialogFooter = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogFooter),{ssr : false});
const DialogTrigger = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogTrigger),{ssr : false});
const Popover = dynamic(() => import("@/components/ui/popover").then((mod) => mod.Popover),{ssr : false});
const PopoverContent = dynamic(() => import("@/components/ui/popover").then((mod) => mod.PopoverContent),{ssr : false});
const PopoverTrigger = dynamic(() => import("@/components/ui/popover").then((mod) => mod.PopoverTrigger),{ssr : false});
import { cn } from "@/lib/utils";
import { DialogContent , DialogHeader , DialogTitle} from "@/components/ui/dialog";
import apiRequest from "./custom-components/apiRequest";
import { Context } from "@/context/LoaderContext";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";

export default function TaskDialog({ name, isEdit = false, task = {} }) {
  const { getToken } = useAuth();
  const { setLoader } = useContext(Context);
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const [details, setDetails] = useState({
    title: "",
    description: "",
    category: "",
    status: "pending",
    deadline: null,
  });

  useEffect(() => {
      setDetails({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        status: task.status || "pending",
        deadline: task.deadline ? new Date(task.deadline) : null,
    })
  }, [isOpen]);

  const handleDetailsChange = useCallback((e) => {
    setDetails((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setDetails((prev) => ({ ...prev, deadline: date }));
    setIsPopoverOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!details.title || !details.description) {
      toast.error("Please fill all the Fields ")
      return;
    }
    try {
      setLoader(true);
      const token = await getToken();
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/todo/${task._id}` : `${process.env.NEXT_PUBLIC_API_URL}/todo`;
      const method = isEdit ? "PUT" : "POST";
      await apiRequest(url, method, details, { Authorization: `Bearer ${token}` });
      setIsOpen(false);
      toast.success(isEdit ? "Task Updated Successfully" : "Task Added Successfully")
    } catch (error) {
      toast.error(error)
      setLoader(false)
    } 
  }, [details, getToken, isEdit, setLoader, task._id]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{name}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {["title", "description", "category"].map((field) => (
            <div key={field} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field} className="text-right capitalize">
                {field}
              </Label>
              <Input id={field} value={details[field]} onChange={handleDetailsChange} className="col-span-3" />
            </div>
          ))}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Deadline</Label>
            <Popover c open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger   asChild>
                <Button variant="outline" className={cn(" justify-start text-left  col-start-2 col-end-5 w-[100%]", !details.deadline && "text-muted-foreground")}>
                  <CalendarIcon className=" h-5 w-5" />
                  {details.deadline ? format(details.deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={details.deadline} onSelect={handleDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>{isEdit ? "Update Task" : "Add Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

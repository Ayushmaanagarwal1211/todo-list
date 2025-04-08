"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AppDispatch } from '@/slice/store'; // Adjust the path if needed

const Table = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.Table),
  { ssr: false }
);
const TableBody = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableBody),
  { ssr: false }
);
const TableCell = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableCell),
  { ssr: false }
);
const TableHead = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHead),
  { ssr: false }
);
const TableHeader = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHeader),
  { ssr: false }
);
const TableRow = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableRow),
  { ssr: false }
);
const DropdownMenu = dynamic(
  () => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenu),
  { ssr: false }
);
const DropdownMenuCheckboxItem = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then(
      (mod) => mod.DropdownMenuCheckboxItem
    ),
  { ssr: false }
);
const DropdownMenuContent = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then(
      (mod) => mod.DropdownMenuContent
    ),
  { ssr: false }
);
const DropdownMenuTrigger = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then(
      (mod) => mod.DropdownMenuTrigger
    ),
  { ssr: false }
);
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { DatePickerWithRange } from "./DateRange";
import { Context } from "@/context/Context";
import {setFilters,setCurrentPage, fetchPaginatedData} from '../slice/todoSlice'
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number, filters: { from: String; to: String }) => void;
  tags: string[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  totalPages,
  tags,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    const filters = useSelector((state : any) => state.todo.filters);
    const currentPage = useSelector((state: any) => state.todo.currentPage);

    // const {   setCurrentPage} = context;

      const [dateRange, setDateRange] = useState({ from: null, to: null });
const dispatch  : AppDispatch = useDispatch()
      useEffect(() => {
        if (dateRange.from && dateRange.to) {
          // setFilters(prev => ({
          //   ...prev,
            // from: new Date(dateRange.from!).toLocaleDateString(),
            // to: new Date(dateRange.to!).toLocaleDateString(),
          // }));
          dispatch(setFilters({...filters,  from: new Date(dateRange.from!).toLocaleDateString(),
            to: new Date(dateRange.to!).toLocaleDateString()}))
        } else if (!dateRange.from && !dateRange.to) {
          dispatch(setFilters({...filters,  from: "",
            to: ""}))
        }
      }, [dateRange]);
      const {getToken} = useAuth()
      useEffect(()=>{
        getToken().then((token : any)=>{
          dispatch(fetchPaginatedData(token))
        })
          
      },[filters])
      



  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center flex-wrap py-4 max-sm:gap-2 ">
        <Input
          placeholder="Filter Todos..."
          value={filters.title}
          onChange={(event) => {
            // setFilters({ ...filters, title: event.target.value });
            dispatch(setFilters({...filters, title: event.target.value}))
            // table.getColumn("title")?.setFilterValue(event.target.value)
            // setTitle(event.target.value)
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
          <DatePickerWithRange className="" onChange={setDateRange} />
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter Category</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            {["work", "personal", "study", "shopping", "other"].map(
              (category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...filters.categories, category]
                      : filters.categories.filter((c : any) => c !== category);
                    // setFilters((prev) => ({ ...prev, categories: updated }));
                    dispatch(setFilters({ ...filters, categories: updated }))
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter Tags</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            {tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => {
                  const updated = checked
                    ? [...selectedTags, tag]
                    : selectedTags.filter((t) => t !== tag);
                  setSelectedTags(updated);
                  // setFilters((prev) => ({ ...prev, tags: updated }));
                  dispatch(setFilters({ ...filters, tags: updated }))
                }}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(setCurrentPage(currentPage+1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

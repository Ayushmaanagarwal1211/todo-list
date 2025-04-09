"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import useDebounce from "./custom-components/useDebounce";
import { FixedSizeList as List } from "react-window";

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
import {
  setFilters,
  setCurrentPage,
  fetchPaginatedData,fetchTags
} from "../slice/todoSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
const Row = ({ index, style ,data}) => {
  const { tags, selectedTags, setSelectedTags, filters, dispatch } = data;

  const tag = tags[index];
  const checked = selectedTags.includes(tag);

  return (
    <DropdownMenuCheckboxItem
      key={tag}
      style={style}
      checked={checked}
      onCheckedChange={(checked) => {
        const updated = checked
          ? [...selectedTags, tag]
          : selectedTags.filter((t) => t !== tag);
        setSelectedTags(updated);
        dispatch(setFilters({ ...filters, tags: updated }));
      }}
    >
      {tag}
    </DropdownMenuCheckboxItem>
  );
};
export default function DataTable({ columns, data }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const tags = useSelector((state) => state.todo.tags);
  const filters = useSelector((state) => state.todo.filters);
  const currentPage = useSelector((state) => state.todo.currentPage);
  const totalPages = useSelector((state) => state.todo.totalPages);
  const tasks = useSelector((state) => state.todo.tasks);
  const isFirstRender = useRef(true);
  const debouncedTitle = useDebounce(filters.title, 500);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const dispatch = useDispatch();
  const [isModalOpen,setIsModalOpen] = useState(true)
  useLayoutEffect(() => {
    isFirstRender.current = true;
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      dispatch(
        setFilters({
          ...filters,
          from: new Date(dateRange.from).toLocaleDateString(),
          to: new Date(dateRange.to).toLocaleDateString(),
        })
      );
    } else if (!dateRange.from && !dateRange.to) {
      dispatch(setFilters({ ...filters, from: "", to: "" }));
    }
  }, [dateRange]);
  const { getToken } = useAuth();
  useEffect(() => {

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getToken().then((token) => {
      dispatch(fetchPaginatedData(token));
    });
  }, [
   debouncedTitle,filters.to,filters.from,filters.categories,filters.tags,currentPage
  ]);

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
            dispatch(setFilters({ ...filters, title: event.target.value }));
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
                      : filters.categories.filter((c) => c !== category);
                    dispatch(setFilters({ ...filters, categories: updated }));
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu onOpenChange={async ()=>{
          if(isModalOpen){
            const token = await getToken()
              dispatch(fetchTags(token))
          }
          setIsModalOpen(!isModalOpen)

        }}>
          <DropdownMenuTrigger asChild>

              <Button variant="outline" >Filter Tags</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent  className="p-0">
            {tags.length ==0 ? <div>No Tags Found</div>:
<List
      height={240} 
      itemCount={tags.length}
      itemSize={40} 
      width="100%"

      itemData={{ tags, selectedTags, setSelectedTags, filters, dispatch }}

    >
      {Row}
    </List>
}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border min-h-[100%]">
        {tasks.length==0 ? (
          <div>Loading</div>
        ) : (
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
        )}
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(setCurrentPage(Number(currentPage - 1)));
            }}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(setCurrentPage(Number(currentPage + 1)));
            }}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

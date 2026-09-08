"use client"

import * as React from "react"

import { 
  useTable, 
  type ColumnDef, 
  type RowData,
  type ColumnVisibilityState,
  type SortingState
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { features, type DataTableFeatures } from "./data_table_features"
import { DataTablePagination } from "@/components/ui/data_table_pagination"
import { DataTableViewOptions } from "@/components/ui/data_table_view_options"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  searchPlaceholder?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Buscar em qualquer coluna...",
}: DataTableProps<TData>) {
  
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useTable({
    features,
    data,
    columns,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4 justify-end space-x-3">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="w-[300px] border-gray-300" 
        />
        <DataTableViewOptions table={table} />
      </div>

      <div className="overflow-hidden rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-700">
                      {header.isPlaceholder
                        ? null
                        : <table.FlexRender header={header} />
                      }
                    </TableHead>
                  )
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
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  Nenhum documento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )    
}      
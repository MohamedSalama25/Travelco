'use client'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, type ColumnDef, type SortingState, Row } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Eye, RotateCcw, Plus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import NoDataMsg from '@/molecules/NoDataMsg'
import { Button } from './ui/button'
export interface Action<TData> {
  label: string | ((rowData: TData) => string);
  classname?: string | ((rowData: TData) => string);
  onClick: (rowData: TData) => void;
}

interface UniTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  actions?: Action<TData>[];
  tableName?: string;
  filterActions?: (rowData: TData, actions: Action<TData>[]) => Action<TData>[];
  onRowSelect?: (selectedRows: TData[]) => void;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
  headerActions?: Action<TData>[];
  isLoading?: boolean;
  currentPage?: number;
  onPerPageChange?: (perPage: number) => void;
  onRowClick?: (rowData: TData) => void;
}


const UniTable = <TData extends object>({
  columns,
  data,
  actions,
  filterActions,
  onRowSelect,
  totalItems,
  itemsPerPage,
  onPageChange,
  headerActions,
  currentPage,
  tableName,
  onRowClick
}: UniTableProps<TData>) => {
  const t = useTranslations('table');
  const locale = useLocale();
  console.log("UniTable Props:", { columns, data, actions, filterActions, onRowSelect, totalItems, itemsPerPage, onPageChange, headerActions, currentPage, tableName, onRowClick });
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: currentPage && currentPage > 0 ? currentPage - 1 : 0, // initial page index
    pageSize: itemsPerPage, // initial page size
  })

  // Get user data and role inside the component
  const user = { role: 'admin' };
  const userRole = user?.role;

  const getResolvedLabel = (action: Action<TData>, rowData: TData) =>
    typeof action.label === 'function' ? action.label(rowData) : action.label;
  const getResolvedClass = (action: Action<TData>, rowData: TData) =>
    typeof action.classname === 'function' ? action.classname(rowData) : '';

  // Log sorting state changes for debugging
  useEffect(() => {
  }, [sorting]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: itemsPerPage,
    }));
  }, [itemsPerPage]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: (currentPage && currentPage > 0) ? currentPage - 1 : 0,
    }));
  }, [currentPage]);

  // Add enableSorting: true to all columns by default
  const columnsWithSorting = columns.map(column => ({
    ...column,
    enableSorting: column.enableSorting !== false // Default to true unless explicitly set to false
  })).filter(column => { // Filter out 'status' column if user is a 'user'
    if (userRole === 'user' && column.id === 'status') { // Changed accessorKey to id
      return false;
    }
    return true;
  });


  const columnsWithActions = [
    ...(headerActions && headerActions.length > 0 && userRole !== 'user' ? [{ // Hide header actions if user is 'user'
      id: 'header-actions',
      header: t('actions'),
      cell: () => (
        <div className="relative flex items-center justify-end gap-2 pr-2">
          {headerActions?.map((action, index) => {
            const actionLabel = getResolvedLabel(action, {} as TData);
            let IconComponent: React.ElementType | null = null;

            switch (actionLabel) {
              case 'Add':
                IconComponent = Plus;
                break;
              // Add more cases for other header actions if needed
              default:
                break;
            }

            return (
              <Tooltip key={index} >
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`h-8 w-8 p-0 data-[state=open]:bg-muted `}
                    onClick={(event) => {
                      event.stopPropagation();
                      action.onClick({} as TData);
                    }}
                  >
                    {IconComponent && <IconComponent className={`h-4 w-4 ${actionLabel === 'Delete' ? 'text-red-500' : 'text-primary'}`} />}
                    <span className="sr-only">{actionLabel}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{actionLabel}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ),
      size: 80,
    }] : []),
    // User provided columns with sorting enabled by default
    ...columnsWithSorting,
    // Actions column (only if actions exist and not empty, and user is not 'user')
    ...(actions && actions.length > 0 ? [{
      id: 'actions',
      header: t('actions'),
      cell: ({ row }: { row: Row<TData> }) => {
        // Apply filterActions if provided, otherwise use original actions
        const filteredActions = filterActions
          ? filterActions(row.original, actions)
          : actions;

        // If no actions remain after filtering, return null to hide the column
        if (!filteredActions || filteredActions.length === 0) {
          return null;
        }

        return (
          <div className="relative flex items-center justify-end gap-2 pr-2">
            {filteredActions?.map((action, index) => {
              const actionLabel = getResolvedLabel(action, row.original);
              const actionClass = getResolvedClass(action, row.original);
              let IconComponent: React.ElementType | null = null;

              switch (actionLabel) {
                case 'Edit':
                  IconComponent = Edit;
                  break;
                case 'View':
                  IconComponent = Eye;
                  break;
                case 'Delete':
                  IconComponent = Trash2;
                  break;
                case 'Details':
                  IconComponent = Eye;
                  break;
                case 'Restore':
                  IconComponent = RotateCcw;
                  break;
                default:
                  break;
              }
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`h-8 w-8 p-0 data-[state=open]:bg-muted ${actionClass}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        action.onClick(row.original);
                      }}
                    >
                      {IconComponent && <IconComponent className={`h-4 w-4 ${actionLabel === 'Delete' ? 'text-red-500' : 'text-primary'}`} />}
                      <span className="sr-only">{actionLabel}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{actionLabel}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        );
      },
      size: 80,
    }] : []),
  ]

  const table = useReactTable({
    data,
    pageCount: Math.ceil(totalItems / itemsPerPage),
    state: {
      rowSelection,
      sorting,
      pagination: { pageIndex: (currentPage && currentPage > 0) ? currentPage - 1 : 0, pageSize: itemsPerPage },
    },
    columns: columnsWithActions,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Tell TanStack Table that we'll handle pagination ourselves
  })


  // Notify parent of selection changes
  useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getSelectedRowModel().rows
      onRowSelect(selectedRows.map(row => row.original))
    }
  }, [rowSelection, onRowSelect, table])

  // Handle external page changes
  useEffect(() => {
    // No need to update internal pagination state if currentPage is already controlled by props
    // This useEffect is no longer needed as pageIndex is directly set from currentPage prop in useReactTable state
  }, [pagination.pageIndex, onPageChange])

  // Check if data is empty, null, or undefined
  const hasNoData = !data || data.length === 0

  return (
    <div className="overflow-visible border-color">
      {hasNoData ? (
        <NoDataMsg
          title={t('noData')}
          description={t('noDataDescription')}
          additionalMessage={t('noDataMessage')}
        />
      ) : (
        <div className="rounded-lg overflow-x-auto max-w-full shadow-sm">
          <table className="w-full divide-y divide-border">
            <thead className="bg-muted/50 ">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider ${header.id === 'actions' || header.id === 'header-actions' ? 'text-center' : 'text-center'} `}
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className="flex items-center justify-center cursor-pointer select-none group text-center ps-3"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="ml-2 relative w-4 flex-none ">
                            {{
                              asc: (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ),
                              desc: (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ),
                            }[header.column.getIsSorted() as string] ?? (
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                              )}
                          </span>
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={`hover:bg-muted/50 data-[state=selected]:bg-muted/50 transition-all duration-150 ease-in-out ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row.original)} // Add onClick handler
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-3 whitespace-nowrap text-sm text-foreground font-light text-center"
                    >
                      {/* Check if the column is an action column */}
                      {cell.column.id === 'actions' || cell.column.id === 'header-actions' ? (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      ) : (
                        cell.getValue() ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap ">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {String(cell.getValue())}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <h1 className="text-muted-foreground font-bold">-</h1>
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="border-t bg-muted/30 py-3 px-4 flex items-center justify-between text-sm text-muted-foreground font-medium flex-wrap gap-y-2">
            <span className="flex items-center gap-1">
              {data.length} {t('of')}{" "}
              {totalItems} {tableName ? tableName : t('users')}.
            </span>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center justify-center text-sm font-medium">
                {t('page')} {currentPage || 1} {t('of')} {Math.ceil(totalItems / itemsPerPage) || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onPageChange?.(1)
                  }}
                  disabled={currentPage === 1 || !table.getCanPreviousPage()}
                >
                  <span className="sr-only">{t('goToFirstPage')}</span>
                  {locale === 'ar' ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onPageChange?.((currentPage || 1) - 1)
                  }}
                  disabled={currentPage === 1 || !table.getCanPreviousPage()}
                >
                  <span className="sr-only">{t('goToPreviousPage')}</span>
                  {locale === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onPageChange?.((currentPage || 1) + 1)
                  }}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage) || !table.getCanNextPage()}
                >
                  <span className="sr-only">{t('goToNextPage')}</span>
                  {locale === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onPageChange?.(Math.ceil(totalItems / itemsPerPage) || 1)
                  }}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage) || !table.getCanNextPage()}
                >
                  <span className="sr-only">{t('goToLastPage')}</span>
                  {locale === 'ar' ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UniTable
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '../ui/table';
  import { LoadingSpinner } from '../feedback/LoadingSpinner';
  
  export interface Column<T> {
    header: string | ((props: { sortable?: boolean }) => React.ReactNode);
    accessor: keyof T | ((row: T, index?: number) => React.ReactNode);
  }
  
  interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
  }
  
  export function DataTable<T>({ 
    columns, 
    data, 
    loading, 
    onRowClick,
    emptyMessage = "No data available" 
  }: DataTableProps<T>) {
    if (loading) {
      return <LoadingSpinner />;
    }
  
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {typeof column.header === 'function' 
                    ? column.header({ sortable: false })
                    : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted' : ''}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {typeof column.accessor === 'function'
                        ? column.accessor(row, rowIndex)
                        : String(row[column.accessor])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
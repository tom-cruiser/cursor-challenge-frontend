import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
  caption?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "No records found.",
  caption,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm text-health-text">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-health-text-muted",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-health-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-border-subtle/70 transition-colors last:border-b-0 hover:bg-surface-overlay/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3 text-health-text", column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

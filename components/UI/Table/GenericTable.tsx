import React from "react";
import TableSkeleton from "./TableSkelton";

type ColumnConfig<T> = {
  header: string;
  key: keyof T;
  render?: (value: unknown, item: T) => React.ReactNode;
};

type Action<T> = {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  className?: string;
};

type GenericTableProps<T> = {
  data: T[];
  columns: ColumnConfig<T>[];
  actions?: Action<T>[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
};

const GenericTable = <T extends { id: string | number }>({
  data,
  columns,
  actions,
  title,
  subtitle,
  isLoading,
  error,
}: GenericTableProps<T>) => {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="pb-4 overflow-x-auto w-[100%]">
      <div className=" p-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
        )}

        <div className="overflow-x-auto relative border border-gray-200 rounded-lg">
          {/* Add loading overlay */}
          {isLoading ? (
            <TableSkeleton columnCount={5} rowCount={10} hasActions={true} />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key])}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {actions.map((action) => (
                            <button
                              key={action.label}
                              onClick={() => action.onClick(item)}
                              className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                action.className ??
                                "text-blue-600 hover:text-blue-800"
                              }`}
                            >
                              {action.icon && (
                                <span className="mr-1">{action.icon}</span>
                              )}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericTable;

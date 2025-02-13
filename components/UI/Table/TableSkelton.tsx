import React from "react";

const TableSkeleton = ({
  columnCount = 4,
  rowCount = 5,
  hasActions = true,
}) => {
  // Add actions column if needed
  const totalColumns = hasActions ? columnCount + 1 : columnCount;

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {[...Array(totalColumns)].map((_, index) => (
            <th key={index} className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(rowCount)].map((_, rowIndex) => (
          <tr key={rowIndex}>
            {[...Array(totalColumns)].map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                {/* Make action column buttons if it's the last column and hasActions is true */}
                {hasActions && colIndex === totalColumns - 1 ? (
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                ) : (
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableSkeleton;

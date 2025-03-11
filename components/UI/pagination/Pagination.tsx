// import React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// type PaginationProps = {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   pageSize: number;
//   onPageChange: (page: number) => void;
// };

// const Pagination = ({
//   currentPage,
//   totalPages,
//   totalItems,
//   pageSize,
//   onPageChange,
// }: PaginationProps) => {
//   const getPageNumbers = () => {
//     const pages = [];
//     const showEllipsis = totalPages > 7;

//     if (!showEllipsis) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//       return pages;
//     }

//     // Always show first page
//     pages.push(1);

//     if (currentPage > 3) {
//       pages.push("ellipsis1");
//     }

//     // Show pages around current page
//     for (
//       let i = Math.max(2, currentPage - 1);
//       i <= Math.min(currentPage + 1, totalPages - 1);
//       i++
//     ) {
//       pages.push(i);
//     }

//     if (currentPage < totalPages - 2) {
//       pages.push("ellipsis2");
//     }

//     // Always show last page
//     if (totalPages > 1) {
//       pages.push(totalPages);
//     }

//     return pages;
//   };

//   const startItem = (currentPage - 1) * pageSize + 1; // 1-based calculation
//   const endItem = Math.min(currentPage * pageSize, totalItems);

//   return (
//     <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 ">
//       {/* Mobile version */}
//       <div className="flex flex-1 justify-between sm:hidden">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 0}
//           className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Previous
//         </button>
//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage >= totalPages - 1}
//           className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Next
//         </button>
//       </div>

//       {/* Desktop version */}
//       <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between ">
//         <div>
//           <p className="text-sm text-gray-700">
//             Showing <span className="font-medium">{startItem}</span> to{" "}
//             <span className="font-medium">{endItem}</span> of{" "}
//             <span className="font-medium">{totalItems}</span> results
//           </p>
//         </div>
//         <div className="w-[40%] mx-auto ">
//           <nav
//             className="isolate inline-flex -space-x-px rounded-md shadow-sm"
//             aria-label="Pagination"
//           >
//             <button
//               onClick={() => onPageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <span className="sr-only">Previous</span>
//               <ChevronLeft className="h-5 w-5" />
//             </button>

//             {getPageNumbers().map((pageNumber, index) =>
//               pageNumber === "ellipsis1" || pageNumber === "ellipsis2" ? (
//                 <span
//                   key={pageNumber}
//                   className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
//                 >
//                   ...
//                 </span>
//               ) : (
//                 <button
//                   key={index}
//                   onClick={() => onPageChange(Number(pageNumber) - 1)}
//                   className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
//                     ${
//                       currentPage === Number(pageNumber) 
//                         ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
//                         : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
//                     }`}
//                 >
//                   {pageNumber}
//                 </button>
//               )
//             )}

//             <button
//               onClick={() => onPageChange(currentPage + 1)}
//               disabled={currentPage >= totalPages} // Disabled on last page
//               className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <span className="sr-only">Next</span>
//               <ChevronRight className="h-5 w-5" />
//             </button>
//           </nav>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Pagination;




interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  availablePages?: number[];
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  availablePages,
}: PaginationProps) => {
  const pagesToShow = availablePages || Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );
  
  const getVisiblePages = () => {
    if (pagesToShow.length <= 7) {
      return pagesToShow;
    }
    
    const currentIndex = pagesToShow.indexOf(currentPage);
    if (currentIndex === -1) return pagesToShow.slice(0, 7);
    
    if (currentIndex < 3) {
      return [...pagesToShow.slice(0, 5), "...", pagesToShow[pagesToShow.length - 1]];
    } else if (currentIndex > pagesToShow.length - 4) {
      return [pagesToShow[0], "...", ...pagesToShow.slice(pagesToShow.length - 5)];
    } else {
      return [
        pagesToShow[0],
        "...",
        pagesToShow[currentIndex - 1],
        pagesToShow[currentIndex],
        pagesToShow[currentIndex + 1],
        "...",
        pagesToShow[pagesToShow.length - 1],
      ];
    }
  };
  
  const visiblePages = getVisiblePages();
  
  return (
    <div className="flex justify-between items-center p-4">
      <div className="text-sm text-muted-foreground">
        {`Show ${((currentPage - 1) * pageSize) + 1} to ${
          Math.min(currentPage * pageSize, totalItems)
        } from ${totalItems}`}
      </div>
      
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(pagesToShow[0])}
          disabled={currentPage === pagesToShow[0]}
          className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          First
        </button>
        
        <button
          onClick={() => {
            const currentIndex = pagesToShow.indexOf(currentPage);
            if (currentIndex > 0) {
              onPageChange(pagesToShow[currentIndex - 1]);
            }
          }}
          disabled={currentPage === pagesToShow[0]}
          className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          Previous
        </button>
        
        {visiblePages.map((page, index) => 
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-foreground">...</span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 rounded ${
                page === currentPage 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {page}
            </button>
          )
        )}
        
        <button
          onClick={() => {
            const currentIndex = pagesToShow.indexOf(currentPage);
            if (currentIndex < pagesToShow.length - 1) {
              onPageChange(pagesToShow[currentIndex + 1]);
            }
          }}
          disabled={currentPage === pagesToShow[pagesToShow.length - 1]}
          className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          Next
        </button>
        
        <button
          onClick={() => onPageChange(pagesToShow[pagesToShow.length - 1])}
          disabled={currentPage === pagesToShow[pagesToShow.length - 1]}
          className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;
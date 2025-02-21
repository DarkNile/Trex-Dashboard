import React, { useState } from "react";
import { ArchiveRestore, Pen, Trash } from "lucide-react";
import { gql } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import GenericTable from "../UI/Table/GenericTable";
import Pagination from "../UI/pagination/Pagination";


const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(pageable: { page: $page }, extraFilter: { deleted: true }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
        subChapters {
          _id
        }
      }
    }
  }
`;

// const DELETE_PRODUCT = gql`
// mutation HardDeleteProduct($id: String!) {
//     hardDeleteProduct(id: $id) {
//         _id
//         HSCode
//         nameEn
//         nameAr
//         note
//         defaultDutyRate
//         serviceTax
//         adVAT
//         deletedAt
//         createdAt
//         updatedAt
//     }
// }
// `;

const RESTORE_CHAPTER = gql`
mutation DeleteChapter($id: ID!) {
    restoreChapter(id: $id) {
        _id
        nameEn
        nameAr
        deletedAt
           }
}
`;


type ChapterFromAPI = {
  _id: string;
  nameAr: string;
  nameEn: string;
  createdAt: string;
};

type Chapter = ChapterFromAPI & { id: string };




    const ArchiveChapterModal = () => {

  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;


  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_CHAPTERS,
    variables: {
      page: currentPage,
      size: pageSize,
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });


  // const { execute: deleteProduct } = useGenericMutation({
  //   mutation: DELETE_PRODUCT,
  //   onSuccess: () => {
  //     refetch();
  //   },
  //   onError: (error) => {
  //     console.log("Error deleting product:", error);
  //   },
  // });

  // const handleDelete = (product: Product) => {
  //   deleteProduct({ id: product._id });
  // };



  const { execute: restoreChapter } = useGenericMutation({
    mutation: RESTORE_CHAPTER,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error restoring chapter:", error);
    },
  });

  const handleRestore = (chapter: Chapter) => {
    restoreChapter({ id: chapter._id });
  };

  const transformedData: Chapter[] = (data?.getChapters?.data || []).map(
    (item: ChapterFromAPI) => ({
      ...item,
      id: item._id,
    })
  );


  const columns: {
      header: string;
      key: keyof Chapter;
      render?: (value: unknown, item: Chapter) => React.ReactNode;
    }[] = [
      {
        header: "Arabic Name",
        key: "nameAr",
        render: (value) => <span className="font-arabic">{`${value}`}</span>,
      },
      {
        header: "English Name",
        key: "nameEn",
      },
      {
        header: "Created At",
        key: "createdAt",
        render: (value) => <span className="font-arabic">{`${value}`}</span>,
      },
    ];

  const actions = [
    // {
    //   label: "Delete",
    //   onClick: handleDelete,
    //   icon: <Trash className="w-4 h-4" />,
    //   className: "text-red-500",
    // },
    {
      label: "Restore",
      onClick: handleRestore,
      className: "text-blue-500",
      icon: <ArchiveRestore className="w-4 h-4" />,
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };



  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-red-950">
            <Trash className="w-4 h-4 mr-2" />
            Deleted Chapters
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Chapters</DialogTitle>
          </DialogHeader>
          <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Chapters: ${
          data?.getChapters?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.getChapters?.pageNumber}
          totalPages={data?.getChapters?.totalPages || 1}
          totalItems={data?.getChapters?.totalSize || 0}
          pageSize={data?.getChapters?.pageSize}
          onPageChange={handlePageChange}
        />
      )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-red-950 text-white"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArchiveChapterModal;

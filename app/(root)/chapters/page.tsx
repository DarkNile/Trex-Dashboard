"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { EyeIcon, Pen, TrashIcon } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import CreateChapterModal from "@/components/chapter/CreateChapterModal";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";
import UpdateChapterModal from "@/components/chapter/UpdateChapterModal";
import { useRouter } from "next/navigation";

const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(pageable: { page: $page }, extraFilter: { deleted: false }) {
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

const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id)
  }
`;

type ChapterFromAPI = {
  _id: string;
  nameAr: string;
  nameEn: string;
  createdAt: string;
};

// Extended type to include the required 'id' field for GenericTable
type Chapter = ChapterFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const router = useRouter();

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

  const { execute: deleteChapter } = useGenericMutation({
    mutation: DELETE_CHAPTER,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting chapter:", error);
      toast.error(`Error deleting chapter: `);
    },
  });

  const handleDelete = (chapter: Chapter) => {
    deleteChapter({ id: chapter._id });
  };

  const handleEdit = (chapter: Chapter) => {
    console.log("Edit chapter:", chapter);
    setSelectedChapter(chapter.id);
    setOpenUpdateModal(true);
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Chapter[] = (data?.getChapters?.data || []).map(
    (item: ChapterFromAPI) => ({
      ...item,
      id: item._id, // Add the required 'id' field
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
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <TrashIcon className="w-4 h-4" />,
      className: "text-red-500",
    },
    {
      label: "Edit",
      onClick: handleEdit,
      icon: <Pen className="w-4 h-4" />,
      className: "text-blue-500",
    },
    {
      label: "View Chapter",
      onClick: (item: Chapter) => {
        router.push(`chapters/${item.id}`);
      },
      icon: <EyeIcon className="w-4 h-4" />,
      className: "text-green-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    console.log("New page:", newPage);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Chapters
        </h1>
        <CreateChapterModal onSuccess={refetch} />

        {selectedChapter && openUpdateModal && (
          <UpdateChapterModal
            chapterId={selectedChapter}
            onSuccess={refetch}
            onClose={() => setSelectedChapter(null)}
          />
        )}
      </div>
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
      {!loading && !error && data?.getChapters?.totalPages && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.getChapters.totalPages || 1}
          totalItems={data.getChapters.totalSize || 0}
          pageSize={data.getChapters.pageSize || pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;

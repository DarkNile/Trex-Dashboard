"use client";
import React, { use, useState } from "react";
import { gql } from "@apollo/client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Pencil, Trash2, BookOpen, Plus } from "lucide-react";
import { Badge } from "@/components/UI/badge";
import GenericTable from "@/components/UI/Table/GenericTable";
import CreateSubChapterModal from "@/components/chapter/CreateSubChapterModal";
import UpdateChapterModal from "@/components/chapter/UpdateChapterModal";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";

// Types remain unchanged...
interface SubChapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
type TransformedSubChapter = SubChapter & { id: string };

interface ChapterDetail {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  chapterId: ChapterDetail;
  subChapters: SubChapter[];
}

interface ChapterResponse {
  chapter: Chapter;
}

const CHAPTER_QUERY = gql`
  query Chapter($id: ID!) {
    chapter(id: $id) {
      _id
      nameEn
      nameAr
      deletedAt
      createdAt
      updatedAt
      chapterId {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
      }
      subChapters {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id)
  }
`;

export default function ChapterPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedSubChapter, setSelectedSubChapter] =
    useState<SubChapter | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, loading, error, refetch } = useGenericQuery<ChapterResponse>({
    query: CHAPTER_QUERY,
    variables: { id },
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

  const handleDelete = (subChapter: TransformedSubChapter) => {
    deleteChapter({ id: subChapter._id });
  };

  const handleEdit = (subChapter: TransformedSubChapter) => {
    setSelectedSubChapter(subChapter);
  };

  const columns = [
    {
      header: "English Name",
      key: "nameEn" as keyof TransformedSubChapter,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      header: "Arabic Name",
      key: "nameAr" as keyof TransformedSubChapter,
      render: (value: unknown) => (
        <div className="font-arabic text-gray-900 text-right">
          {String(value)}
        </div>
      ),
    },
    {
      header: "Created At",
      key: "createdAt" as keyof TransformedSubChapter,
      render: (value: unknown) => (
        <div className="text-sm text-gray-500">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Updated At",
      key: "updatedAt" as keyof TransformedSubChapter,
      render: (value: unknown) => (
        <div className="text-sm text-gray-500">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEdit,
      icon: <Pencil className="h-4 w-4" />,
      className:
        "text-blue-600 hover:text-blue-800 transition-colors duration-200",
    },
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      className:
        "text-red-600 hover:text-red-800 transition-colors duration-200",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data?.chapter) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">
          No chapter found
        </div>
      </div>
    );
  }

  const { chapter } = data;
  const subChaptersData: TransformedSubChapter[] = chapter.subChapters.map(
    (subChapter) => ({
      ...subChapter,
      id: subChapter._id,
    })
  );

  return (
    <div className="bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chapter Details Card */}
        <Card className="mb-8 bg-white shadow-lg border-none">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Chapter Details
                </CardTitle>
              </div>
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800"
              >
                ID: {chapter._id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Parent Chapter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    English Name
                  </p>
                  <p className="text-base text-gray-900">{chapter.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Arabic Name
                  </p>
                  <p className="text-base text-gray-900 font-arabic">
                    {chapter.nameAr}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedSubChapter && (
          <UpdateChapterModal
            chapterId={selectedSubChapter._id}
            onSuccess={() => {
              setSelectedSubChapter(null);
              refetch();
            }}
            onClose={() => setSelectedSubChapter(null)}
          />
        )}

        {isCreateModalOpen && (
          <CreateSubChapterModal
            chapterId={chapter._id}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refetch();
            }}
          />
        )}

        {/* Subchapters Table */}
        <div className="">
          <div className="">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Sub Chapters
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Total: {subChaptersData.length} sub chapters
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub Chapter
              </Button>
            </div>
          </div>
          <GenericTable
            data={subChaptersData}
            columns={columns}
            actions={actions}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

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
// import ArchiveSubChapterModal from "@/components/chapter/ArchiveSubChapterModal";

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
      toast.error(`Error deleting chapter: ${error}`);
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
        <div className="font-medium text-foreground">{String(value)}</div>
      ),
    },
    {
      header: "Arabic Name",
      key: "nameAr" as keyof TransformedSubChapter,
      render: (value: unknown) => (
        <div className="font-arabic text-foreground text-right">
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
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-destructive">Error: {error}</div>
      </div>
    );
  }
  
  if (!data?.chapter) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-muted-foreground">
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
    <div className="bg-muted py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chapter Details Card */}
        <Card className="mb-8 bg-card shadow-lg border-none">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  Chapter Details
                </CardTitle>
              </div>
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground"
              >
                ID: {chapter._id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-muted rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Parent Chapter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    English Name
                  </p>
                  <p className="text-base text-foreground">{chapter.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Arabic Name
                  </p>
                  <p className="text-base text-foreground font-arabic">
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
            <div className="flex justify-between items-start px-8 pt-8 mt-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Sub Chapters
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: {subChaptersData.length} sub chapters
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub Chapter
                </Button>
                {/* <ArchiveSubChapterModal id ={chapter._id}   /> */}
              </div>
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

import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";

const GET_CHAPTER_BY_ID = gql`
  query Chapter($id: ID!) {
    chapter(id: $id) {
      _id
      nameEn
      nameAr
      subChapters {
        _id
      }
    }
  }
`;

const UPDATE_CHAPTER = gql`
  mutation UpdateChapter($chapterInput: UpdateChapterDTO!) {
    updateChapter(chapterInput: $chapterInput) {
      _id
      nameEn
      nameAr
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

interface UpdateChapterModalProps {
  chapterId: string;
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateChapterModal: React.FC<UpdateChapterModalProps> = ({
  chapterId,
  onSuccess,
  onClose,
}) => {
  const { data, loading: queryLoading } = useGenericQuery({
    query: GET_CHAPTER_BY_ID,
    variables: { id: chapterId },
  });

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
  });

  const { execute: updateChapter, isLoading: mutationLoading } =
    useGenericMutation({
      mutation: UPDATE_CHAPTER,
      onSuccess: () => {
        toast.success("Chapter updated successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(`Error updating chapter: ${error.message}`);
      },
    });

  useEffect(() => {
    if (data?.chapter) {
      setFormData({
        nameEn: data.chapter.nameEn,
        nameAr: data.chapter.nameAr,
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Properly structure the variables
    const variables = {
      chapterInput: {
        id: chapterId,
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
      },
    };

    try {
      const result = await updateChapter(variables);
      console.log("Mutation result:", result);
    } catch (error) {
      console.error("Mutation error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Chapter</DialogTitle>
        </DialogHeader>
        {queryLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder="Enter Arabic name"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                placeholder="Enter English name"
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutationLoading}>
              {mutationLoading ? "Updating..." : "Update Chapter"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateChapterModal;

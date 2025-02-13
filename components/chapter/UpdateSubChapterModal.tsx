import React, { useState, useEffect } from "react";

import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { toast } from "react-hot-toast";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "../UI/dialog";
import { Label } from "../UI/label";
import { Input } from "../UI/input";
import { Button } from "../UI/button";

// Mutation with explicit variable naming
const UPDATE_SUBCHAPTER = gql`
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

// TypeScript interfaces
interface SubChapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateChapterDTO {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface UpdateSubChapterModalProps {
  subChapter: SubChapter;
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateSubChapterModal: React.FC<UpdateSubChapterModalProps> = ({
  subChapter,
  onSuccess,
  onClose,
}) => {
  // Form state with proper typing
  const [formData, setFormData] = useState<Omit<UpdateChapterDTO, "id">>({
    nameEn: "",
    nameAr: "",
  });

  // Mutation hook with proper error handling
  const { execute: updateChapter, isLoading: mutationLoading } =
    useGenericMutation({
      mutation: UPDATE_SUBCHAPTER,
      onSuccess: () => {
        toast.success("SubChapter updated successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(`Error updating subchapter: ${error.message}`);
      },
    });

  // Initialize form data when modal opens
  useEffect(() => {
    if (subChapter) {
      setFormData({
        nameEn: subChapter.nameEn,
        nameAr: subChapter.nameAr,
      });
    }
  }, [subChapter]);

  // Handle form submission with proper typing
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const variables = {
    //   chapterInput: {
    //     id: subChapter._id,
    //     chapterId: subChapter._id,
    //     nameEn: formData.nameEn,
    //     nameAr: formData.nameAr,
    //   },
    // };

    updateChapter({
      variables: {
        chapterInput: {
          id: subChapter._id,
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
        },
      },
    });
  };

  // Handle input changes with proper typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Update SubChapter
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr" className="text-sm font-medium">
                Arabic Name
              </Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder="Enter Arabic name"
                className="w-full"
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn" className="text-sm font-medium">
                English Name
              </Label>
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
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutationLoading} className="px-4">
              {mutationLoading ? "Updating..." : "Update SubChapter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSubChapterModal;

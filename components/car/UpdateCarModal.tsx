import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
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
import toast from "react-hot-toast";

// Types
interface Chapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  subChapters: SubChapter[];
}

interface SubChapter {
  _id: string;
  nameEn: string;
  nameAr: string;
}

interface AgreementData {
  _id?: string;
  reducedDutyRate: number;
  agreementId: {
    _id: string;
    name: string;
  };
  applyGlobal: boolean;
}

interface ProductData {
  // HSCode: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  subChapterId: string;
  serviceTax: boolean;
  adVAT: number;
  type: "car";
}

interface UpdateCarModalProps {
  productId: string;
  productData: ProductData;
  onSuccess?: () => void;
  onClose: () => void;
}

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($updateProductInput: UpdateProductInput!) {
    updateProduct(updateProductInput: $updateProductInput)
  }
`;

const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(extraFilter: { deleted: false }, pageable: { page: 1 }) {
      data {
        _id
        nameEn
        nameAr
        subChapters {
          _id
          nameEn
          nameAr
        }
      }
    }
  }
`;

const UpdateCarModal: React.FC<UpdateCarModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  // const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState(productData);
  const [changedFields, setChangedFields] = useState<Partial<ProductData>>({});
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  // const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
  useEffect(() => {
    if (chaptersData?.getChapters?.data && formData.subChapterId) {
      let found = false;
      chaptersData.getChapters.data.forEach((chapter: Chapter) => {
        if (chapter._id === formData.subChapterId) {
          setSelectedName(chapter.nameAr);
          found = true;
        } else {
          chapter.subChapters?.forEach((subChapter: SubChapter) => {
            if (subChapter._id === formData.subChapterId) {
              setSelectedName(subChapter.nameAr);
              found = true;
            }
          });
        }
      });
      if (!found) setSelectedName("Select a Chapter");
    }
  }, [chaptersData, formData.subChapterId]);

  const { execute: updateProduct, isLoading } = useGenericMutation({
    mutation: UPDATE_PRODUCT,
    onSuccess: () => {
      toast.success("Car updated successfully! ✅");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating Car: ${error.message}`);
    },
  });

  const updateChangedFields = (name: keyof ProductData, value: any) => {
    if (Array.isArray(value)) {
      if (JSON.stringify(value) !== JSON.stringify(productData[name])) {
        setChangedFields((prev) => ({ ...prev, [name]: value }));
      } else {
        const { [name]: removed, ...rest } = changedFields;
        setChangedFields(rest);
      }
      return;
    }

    if (typeof productData[name] === "number") {
      const numValue = Number(value);
      if (numValue !== productData[name]) {
        setChangedFields((prev) => ({ ...prev, [name]: numValue }));
      } else {
        const { [name]: removed, ...rest } = changedFields;
        setChangedFields(rest);
      }
      return;
    }

    if (value !== productData[name]) {
      setChangedFields((prev) => ({ ...prev, [name]: value }));
    } else {
      const { [name]: removed, ...rest } = changedFields;
      setChangedFields(rest);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(changedFields).length === 0) {
      toast("No changes detected");
      return;
    }

    const updateData = {
      id: productId,
      type: "car",
      ...changedFields,
    };

    if ("defaultDutyRate" in changedFields) {
      updateData.defaultDutyRate = Number(changedFields.defaultDutyRate);
    }

    if ("adVAT" in changedFields) {
      updateData.adVAT = Number(changedFields.adVAT);
    }

    updateProduct({
      updateProductInput: updateData,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    updateChangedFields(name as keyof ProductData, newValue);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: chapter._id,
    }));
    updateChangedFields("subChapterId", chapter._id);
    setSelectedName(chapter.nameAr);
    setIsChapterDropdownOpen(false);
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: subChapter._id,
    }));
    updateChangedFields("subChapterId", subChapter._id);
    setSelectedName(subChapter.nameAr);
    setIsChapterDropdownOpen(false);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Car</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <div className="space-y-2">
              <Label htmlFor="HSCode">HS Code</Label>
              <Input
                id="HSCode"
                name="HSCode"
                value={formData.HSCode}
                onChange={handleInputChange}
                required
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultDutyRate">Default Duty Rate (%)</Label>
              <Input
                id="defaultDutyRate"
                name="defaultDutyRate"
                type="number"
                value={formData.defaultDutyRate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adVAT">VAT Rate (%)</Label>
              <Input
                id="adVAT"
                name="adVAT"
                type="number"
                value={formData.adVAT}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Chapter</Label>
              <div className="relative" dir="rtl">
                <div
                  className="w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white"
                  onClick={() =>
                    setIsChapterDropdownOpen(!isChapterDropdownOpen)
                  }
                >
                  <span>{selectedName}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>

                {isChapterDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto right-0">
                    {chaptersData?.getChapters?.data.map((chapter: Chapter) => (
                      <div
                        key={chapter._id}
                        className="border-b last:border-b-0"
                      >
                        <div
                          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-right"
                          onClick={() => {
                            if (expandedChapter === chapter._id) {
                              handleChapterSelect(chapter);
                            } else {
                              setExpandedChapter(chapter._id);
                            }
                          }}
                        >
                          {chapter.subChapters?.length > 0 && (
                            <span className="mr-2">
                              {expandedChapter === chapter._id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronLeft className="w-4 h-4" />
                              )}
                            </span>
                          )}
                          <span className="font-medium">{chapter.nameAr}</span>
                        </div>

                        {expandedChapter === chapter._id &&
                          chapter.subChapters?.map((subChapter) => (
                            <div
                              key={subChapter._id}
                              className="pl-8 pr-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-t"
                              onClick={() => handleSubChapterSelect(subChapter)}
                            >
                              <span className="font-medium">
                                {subChapter.nameAr}
                              </span>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="serviceTax"
                name="serviceTax"
                checked={formData.serviceTax}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <Label htmlFor="serviceTax">Service Tax</Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || Object.keys(changedFields).length === 0}
            >
              {isLoading ? "Updating..." : "Update Car"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateCarModal;

import React, { useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast/headless";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { Label } from "../UI/label";
import { Input } from "../UI/input";

// Types
interface Chapter {
  _id: string;
  nameEn: string;
  subChapters: SubChapter[];
}

interface SubChapter {
  _id: string;
  nameEn: string;
}

interface FormData {
  HSCode: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  subChapterId: string;
  agreementId: string;
  serviceTax: boolean;
  adVAT: boolean;
}

// GraphQL Queries
const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(extraFilter: { deleted: false }, pageable: { page: 1 }) {
      data {
        _id
        nameEn
        subChapters {
          _id
          nameEn
        }
      }
    }
  }
`;

const GET_AGREEMENTS = gql`
  query GetAgreements {
    AgreementList(filter: { deleted: false }, pageable: { page: 1 }) {
      data {
        _id
        name
      }
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput)
  }
`;

interface CreateProductModalProps {
  onSuccess?: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  const [formData, setFormData] = useState<FormData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    subChapterId: "",
    agreementId: "",
    serviceTax: false,
    adVAT: false,
  });

  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
  const { data: agreementsData } = useGenericQuery({ query: GET_AGREEMENTS });

  const { execute: createProduct, isLoading } = useGenericMutation({
    mutation: CREATE_PRODUCT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        HSCode: "",
        nameEn: "",
        nameAr: "",
        defaultDutyRate: 0,
        subChapterId: "",
        agreementId: "",
        serviceTax: false,
        adVAT: false,
      });
      setSelectedName("Select a Chapter");
      toast.success("Product created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating product: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProduct({
      createProductInput: {
        ...formData,
        defaultDutyRate: Number(formData.defaultDutyRate),
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: chapter._id,
    }));
    setSelectedName(chapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: subChapter._id,
    }));
    setSelectedName(subChapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic form fields */}
          <div className="space-y-2">
            <Label htmlFor="HSCode">HS Code</Label>
            <Input
              id="HSCode"
              name="HSCode"
              value={formData.HSCode}
              onChange={handleInputChange}
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

          {/* Custom Chapter Dropdown */}
          <div className="space-y-2">
            <Label>Chapter</Label>
            <div className="relative">
              <div
                className="w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white"
                onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
              >
                <span>{selectedName}</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              {isChapterDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {chaptersData?.getChapters?.data.map((chapter: Chapter) => (
                    <div key={chapter._id} className="border-b last:border-b-0">
                      <div
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        )}
                        <span className="font-medium">{chapter.nameEn}</span>
                      </div>

                      {expandedChapter === chapter._id &&
                        chapter.subChapters?.map((subChapter) => (
                          <div
                            key={subChapter._id}
                            className="pl-8 pr-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-t"
                            onClick={() => handleSubChapterSelect(subChapter)}
                          >
                            {subChapter.nameEn}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agreements Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="agreementId">Agreement</Label>
            <select
              id="agreementId"
              name="agreementId"
              value={formData.agreementId}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select an Agreement</option>
              {agreementsData?.AgreementList?.data.map(
                (agreement: { _id: string; name: string }) => (
                  <option key={agreement._id} value={agreement._id}>
                    {agreement.name}
                  </option>
                )
              )}
            </select>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="adVAT"
              name="adVAT"
              checked={formData.adVAT}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <Label htmlFor="adVAT">VAT</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;

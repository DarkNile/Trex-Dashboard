import React, { useState } from "react";
import { Plus, ChevronDown, ChevronRight, X } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";
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
  agreements: string[];
  serviceTax: boolean;
  adVAT: number;
  type: string;
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

// const CREATE_PRODUCT = gql`
//   mutation CreateProduct($createProductInput: CreateProductInput!) {
//     createProduct(createProductInput: $createProductInput)
//   }
// `;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      _id
      HSCode
      nameEn
      nameAr
      defaultDutyRate
      adVAT
      agreements {
        agreementId
      }
      serviceTax
      type
    }
  }
`;

interface CreateProductModalProps {
  onSuccess?: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  const [formData, setFormData] = useState<FormData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    subChapterId: "",
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    type: "regular"
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
        agreements: [],
        serviceTax: false,
        adVAT: 0,
        type: "regular"
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
    console.log("Submitting form data:", {
      ...formData,
      defaultDutyRate: Number(formData.defaultDutyRate),
      adVAT: Number(formData.adVAT),
    });

    const formattedAgreements = formData.agreements.map(agreementId => ({
      agreementId: agreementId
    }));

    createProduct({
      createProductInput: {
        ...formData,
        defaultDutyRate: Number(formData.defaultDutyRate),
        adVAT: Number(formData.adVAT),
        agreements: formattedAgreements
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

  const handleAgreementToggle = (agreements: string)=>{
    setFormData(prev=>({
      ...prev,
      agreements: prev.agreements.includes(agreements)
        ? prev.agreements.filter(id=> id !== agreements)
        : [...prev.agreements, agreements]
    }));
  };

  const getAgreementName =(id: string)=>{
    return agreementsData?.AgreementList?.data.find(
      (agreement: {_id:string; name:string})=> agreement._id===id
    )?.name || '';
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              <Label>Agreements</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsAgreementDialogOpen(true)}
                >
                  <span>Select Agreements</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  {formData.agreements.map((id) => (
                    <div
                      key={id}
                      className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2"
                    >
                      <span className="text-sm">{getAgreementName(id)}</span>
                      <button
                        type="button"
                        onClick={() => handleAgreementToggle(id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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

    <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Agreements</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {agreementsData?.AgreementList?.data.map(
              (agreement: { _id: string; name: string }) => (
                <div
                  key={agreement._id}
                  className="flex items-center space-x-2 py-2 border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    id={`agreement-${agreement._id}`}
                    checked={formData.agreements.includes(agreement._id)}
                    onChange={() => handleAgreementToggle(agreement._id)}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor={`agreement-${agreement._id}`}
                    className="flex-grow cursor-pointer"
                  >
                    {agreement.name}
                  </Label>
                </div>
              )
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setIsAgreementDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProductModal;

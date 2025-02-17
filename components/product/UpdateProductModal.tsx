import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
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
  subChapters: SubChapter[];
}

interface SubChapter {
  _id: string;
  nameEn: string;
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
  HSCode: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  subChapterId: string;
  serviceTax: boolean;
  adVAT: number;
  type: string;
}

interface UpdateFormData extends ProductData {
  agreements: Array<{
    _id?: string;
    agreementId: {
      _id: string;
      name: string;
    };
    reducedDutyRate: number;
    applyGlobal: boolean;
  }>;
}

interface UpdateProductModalProps {
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

// const UPDATE_PRODUCT = gql`
//   mutation UpdateProduct($updateProductInput: UpdateProductInput!) {
//     updateProduct(updateProductInput: $updateProductInput) {
//       _id
//       HSCode
//       nameEn
//       nameAr
//       defaultDutyRate
//       adVAT
//       agreements {
//         agreementId
//       }
//       serviceTax
//       type
//     }
//   }
// `;

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

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  // const [formData, setFormData] = useState(productData);
  const [formData, setFormData] = useState<UpdateFormData>({
    ...productData,
    agreements: productData.agreements.map(agreement => ({
      _id: agreement._id,
      agreementId: agreement.agreementId,
      reducedDutyRate: agreement.reducedDutyRate,
      applyGlobal: agreement.applyGlobal
    }))
  });
  const [changedFields, setChangedFields] = useState<Partial<ProductData>>({});
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const { data: agreementsData } = useGenericQuery({ query: GET_AGREEMENTS });
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });

  useEffect(() => {
    if (chaptersData?.getChapters?.data && formData.subChapterId) {
      let found = false;
      chaptersData.getChapters.data.forEach((chapter: Chapter) => {
        if (chapter._id === formData.subChapterId) {
          setSelectedName(chapter.nameEn);
          found = true;
        } else {
          chapter.subChapters?.forEach((subChapter: SubChapter) => {
            if (subChapter._id === formData.subChapterId) {
              setSelectedName(subChapter.nameEn);
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
      toast.success("Product updated successfully! ✅");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error.message}`);
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

    if (typeof productData[name] === 'number') {
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
      ...changedFields,
    };

    if (changedFields.agreements) {
      updateData.agreements = changedFields.agreements;
    }

    

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
    setSelectedName(chapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: subChapter._id,
    }));
    updateChangedFields("subChapterId", subChapter._id);
    setSelectedName(subChapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  // const handleAgreementToggle = (agreements: string)=>{
  //   setFormData(prev=>({
  //     ...prev,
  //     agreements: prev.agreements.includes(agreements)
  //       ? prev.agreements.filter(id=> id !== agreements)
  //       : [...prev.agreements, agreements]
  //   }));
  // };

  const handleAgreementToggle = (agreement: { _id: string; name: string }) => {
    setFormData(prev => {
      const existingAgreementIndex = prev.agreements.findIndex(
        a => a.agreementId._id === agreement._id
      );
  
      if (existingAgreementIndex !== -1) {
        const newAgreements = [...prev.agreements];
        newAgreements.splice(existingAgreementIndex, 1);
        return { ...prev, agreements: newAgreements };
      }
  
      return {
        ...prev,
        agreements: [
          ...prev.agreements,
          {
            agreementId: {
              _id: agreement._id,
              name: agreement.name
            },
            reducedDutyRate: 0,
            applyGlobal: true
          }
        ]
      };
    });
  };

  const getAgreementName =(id: string)=>{
    return agreementsData?.AgreementList?.data.find(
      (agreement: {_id:string; name:string})=> agreement._id===id
    )?.name || '';
  };

  return (
    <>
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                {formData.agreements.map((agreement) => (
  <div
    key={agreement.agreementId._id}
    className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2"
  >
    <span className="text-sm">{agreement.agreementId.name}</span>
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={agreement.reducedDutyRate}
        onChange={(e) => {
          const newAgreements = formData.agreements.map(a =>
            a.agreementId._id === agreement.agreementId._id
              ? { ...a, reducedDutyRate: Number(e.target.value) }
              : a
          );
          setFormData(prev => ({ ...prev, agreements: newAgreements }));
        }}
        className="w-20 h-6 text-sm"
        placeholder="Rate %"
      />
      <input
        type="checkbox"
        checked={agreement.applyGlobal}
        onChange={(e) => {
          const newAgreements = formData.agreements.map(a =>
            a.agreementId._id === agreement.agreementId._id
              ? { ...a, applyGlobal: e.target.checked }
              : a
          );
          setFormData(prev => ({ ...prev, agreements: newAgreements }));
        }}
        className="w-4 h-4"
      />
    </div>
    <button
      type="button"
      onClick={() => handleAgreementToggle(agreement.agreementId)}
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
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.keys(changedFields).length === 0}
          >
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
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
                        checked={formData.agreements.some(a => a.agreementId._id === agreement._id)}
                        onChange={() => handleAgreementToggle(agreement)}
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

export default UpdateProductModal;

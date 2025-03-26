import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
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
import Textarea from "../UI/textArea";
import { useRouter, useSearchParams } from "next/navigation";
import { saveListState, useFindProductPage } from "@/hooks/generic/findProductPage";

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

interface ScheduleTax {
  min: number;
  max: number;
  fee: number;
  enhancementFee: number;
}
interface FlatScheduleTax {
  per: number;
  fee: number;
  enhancementFee: number;
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
  noteEn: string;
  noteAr: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  subChapterId: string;
  serviceTax: boolean;
  adVAT: number;
  type: "regural" | "car";
  scheduleTaxes?: ScheduleTax[];
  productScheduleTaxType: "traditional" | "nontraditional";
  flatScheduleTax?: FlatScheduleTax;
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

const ADD_AGREEMENTS = gql`
  mutation AddNewAgreementToProduct(
    $addNewAgreementInput: AddNewAgreementInput!
  ) {
    addNewAgreementToProduct(addNewAgreementInput: $addNewAgreementInput) {
      _id
    }
  }
`;

const GET_AGREEMENTS = gql`
  query GetAgreements($page: Int!) {
    AgreementList(pageable: { page: $page }, filter: { deleted: false }) {
      data {
        _id
        name
      }
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;

const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(extraFilter: { deleted: false }, pageable: { page: $page }) {
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
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState<UpdateFormData>({
    ...productData,
    agreements: productData.agreements || [],
    scheduleTaxes: productData.scheduleTaxes || [],
    noteEn: productData.noteEn || '',
  noteAr: productData.noteAr || '',
  productScheduleTaxType: productData.productScheduleTaxType || "traditional",
  flatScheduleTax: {
    per: productData.flatScheduleTax?.per || 0,
    fee: productData.flatScheduleTax?.fee || 0,
    enhancementFee: productData.flatScheduleTax?.enhancementFee || 0,
  },
  });
  const [changedFields, setChangedFields] = useState<Partial<ProductData>>({});
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<{
    id: string;
    nameAr: string;
    type: "chapter" | "subChapter";
  } | null>(null);
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [isScheduleTaxDialogOpen, setIsScheduleTaxDialogOpen] = useState(false);
  const router = useRouter();
  const findProductPage = useFindProductPage();
  const searchParams = useSearchParams();
  const { data: agreementsData, loading: agreementsLoading } = useGenericQuery({
    query: GET_AGREEMENTS,
    variables: {
      page: currentPage,
    },
    onError: (error) => {
      console.error("Agreements loading error:", error);
      toast.error(`Error loading agreements: ${error.message}`);
    },
  });

  const { data: chaptersData, loading: chaptersLoading } = useGenericQuery({
    query: GET_CHAPTERS,
    variables: {
      page: currentPage,
    },
    onError: (error) => {
      console.error("Chapters loading error:", error);
      toast.error(`Error loading chapters: ${error.message}`);
    },
  });

  // Initialize selected chapter from productData
  useEffect(() => {
    if (chaptersData?.getChapters?.data && formData.subChapterId) {
      let found = false;
      chaptersData.getChapters.data.forEach((chapter: Chapter) => {
        chapter.subChapters?.forEach((subChapter: SubChapter) => {
          if (subChapter._id === formData.subChapterId) {
            setSelectedChapter({
              id: subChapter._id,
              nameAr: subChapter.nameAr,
              type: "subChapter",
            });
            found = true;
          }
        });
        if (!found && chapter._id === formData.subChapterId) {
          setSelectedChapter({
            id: chapter._id,
            nameAr: chapter.nameAr,
            type: "chapter",
          });
          found = true;
        }
      });
    }
  }, [chaptersData, formData.subChapterId]);

  useEffect(() => {
    const hasAgreementsChanged =
      JSON.stringify(formData.agreements) !==
      JSON.stringify(productData.agreements);
    if (hasAgreementsChanged) {
      setChangedFields((prev) => ({
        ...prev,
        agreements: formData.agreements,
      }));
    } else {
      const { agreements, ...rest } = changedFields;
      setChangedFields(rest);
    }
  }, [formData.agreements, productData.agreements]);

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

  const { execute: updateAgreements, isLoading: isUpdatingAgreements } =
    useGenericMutation({
      mutation: ADD_AGREEMENTS,
    });

  const updateChangedFields = (name: keyof ProductData, value: any) => {
    if (name === "agreements") {
      const hasAgreementsChanged =
        JSON.stringify(value) !== JSON.stringify(productData.agreements);
      if (hasAgreementsChanged) {
        setChangedFields((prev) => ({ ...prev, agreements: value }));
      } else {
        const { agreements, ...rest } = changedFields;
        setChangedFields(rest);
      }
      return;
    }
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

    const formattedAgreements = formData.agreements.map((agreement) => ({
      agreementId: agreement.agreementId._id,
      reducedDutyRate: agreement.reducedDutyRate,
      applyGlobal: agreement.applyGlobal || false,
    }));

    const updateData = {
      id: productId,
      ...changedFields,
      agreements: formattedAgreements,
      // scheduleTaxes: formData.scheduleTaxes,
      ...(formData.productScheduleTaxType === "traditional" 
        ? { 
            scheduleTaxes: formData.scheduleTaxes?.map(tax => ({
              min: Number(tax.min),
              max: Number(tax.max),
              fee: Number(tax.fee),
              enhancementFee: Number(tax.enhancementFee)
            }))
          }
        : {
            flatScheduleTax: formData.flatScheduleTax 
              ? {
                  per: Number(formData.flatScheduleTax.per),
                  fee: Number(formData.flatScheduleTax.fee),
                  enhancementFee: Number(formData.flatScheduleTax.enhancementFee)
                }
              : undefined
          }
      ),
      productScheduleTaxType: formData.productScheduleTaxType,
    };

    updateProduct({
      updateProductInput: updateData,
    });

    router.push(`products/${productId}`);
  };
  const handleAddScheduleTax = () => {
    setFormData((prev) => {
      const newScheduleTaxes = [
        ...(prev.scheduleTaxes || []),
        { min: 0, max: 0, fee: 0, enhancementFee: 0 },
      ];

      updateChangedFields("scheduleTaxes", newScheduleTaxes);

      return {
        ...prev,
        scheduleTaxes: newScheduleTaxes,
      };
    });
  };

  const handleScheduleTaxChange = (
    index: number,
    field: keyof ScheduleTax,
    value: number
  ) => {
    setFormData((prev) => {
      const newScheduleTaxes = [...(prev.scheduleTaxes || [])];
      newScheduleTaxes[index] = {
        ...newScheduleTaxes[index],
        [field]: value,
      };

      updateChangedFields("scheduleTaxes", newScheduleTaxes);

      return {
        ...prev,
        scheduleTaxes: newScheduleTaxes,
      };
    });
  };

  const handleRemoveScheduleTax = (index: number) => {
    setFormData((prev) => {
      const newScheduleTaxes = [...(prev.scheduleTaxes || [])];
      newScheduleTaxes.splice(index, 1);

      updateChangedFields("scheduleTaxes", newScheduleTaxes);

      return {
        ...prev,
        scheduleTaxes: newScheduleTaxes,
      };
    });
  };

  // const handleInputChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  //   >
  // ) => {
  //   const { name, type, checked, value } = e.target as HTMLInputElement;
  //   const newValue = type === "checkbox" ? checked : value;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: newValue,
  //   }));

  //   updateChangedFields(name as keyof ProductData, newValue);
  // };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;

    // Special handling for productScheduleTaxType
    if (name === 'productScheduleTaxType') {
      const newProductScheduleTaxType = checked ? "nontraditional" : "traditional";
      
      setFormData((prev) => ({
        ...prev,
        productScheduleTaxType: newProductScheduleTaxType,
        // Reset corresponding fields when switching
        scheduleTaxes: newProductScheduleTaxType === "traditional" ? [] : prev.scheduleTaxes,
        flatScheduleTax: newProductScheduleTaxType === "nontraditional" 
          ? { per: 0, fee: 0, enhancementFee: 0 } 
          : undefined
      }));

      updateChangedFields('productScheduleTaxType', newProductScheduleTaxType);
      updateChangedFields('scheduleTaxes', newProductScheduleTaxType === "traditional" ? [] : undefined);
      updateChangedFields('flatScheduleTax', newProductScheduleTaxType === "nontraditional" 
        ? { per: 0, fee: 0, enhancementFee: 0 } 
        : undefined);
      
      return;
    }

    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    updateChangedFields(name as keyof ProductData, newValue);
  };

  const handleChapterSelect = (
    chapter: Chapter | SubChapter,
    type: "chapter" | "subChapter"
  ) => {
    if (type === "chapter") {
      const chap = chapter as Chapter;
      setSelectedChapter({
        id: chap._id,
        nameAr: chap.nameAr,
        type: "chapter",
      });
      setFormData((prev) => ({
        ...prev,
        subChapterId: chap._id,
      }));
      updateChangedFields("subChapterId", chap._id);
    } else {
      const subChap = chapter as SubChapter;
      setSelectedChapter({
        id: subChap._id,
        nameAr: subChap.nameAr,
        type: "subChapter",
      });
      setFormData((prev) => ({
        ...prev,
        subChapterId: subChap._id,
      }));
      updateChangedFields("subChapterId", subChap._id);
    }
    setIsChapterDialogOpen(false);
  };

  const handleAgreementToggle = (agreement: { _id: string; name: string }) => {
    setFormData((prev) => {
      const existingAgreementIndex = prev.agreements.findIndex(
        (a) => a.agreementId._id === agreement._id
      );

      let newAgreements;

      if (existingAgreementIndex !== -1) {
        newAgreements = [...prev.agreements];
        newAgreements.splice(existingAgreementIndex, 1);
      } else {
        newAgreements = [
          ...prev.agreements,
          {
            agreementId: {
              _id: agreement._id,
              name: agreement.name,
            },
            reducedDutyRate: 0,
            applyGlobal: true,
          },
        ];
      }

      updateChangedFields("agreements", newAgreements);

      return { ...prev, agreements: newAgreements };
    });
  };

  const handleAgreementChange = (
    agreementId: string,
    field: "reducedDutyRate" | "applyGlobal",
    value: number | boolean
  ) => {
    setFormData((prev) => {
      const newAgreements = prev.agreements.map((a) =>
        a.agreementId._id === agreementId ? { ...a, [field]: value } : a
      );

      updateChangedFields("agreements", newAgreements);

      return { ...prev, agreements: newAgreements };
    });
  };

  const getAgreementName = (id: string) => {
    return (
      agreementsData?.AgreementList?.data.find(
        (agreement: { _id: string; name: string }) => agreement._id === id
      )?.name || ""
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="noteAr">Arabic Note</Label>
              <Textarea
                id="noteAr"
                name="noteAr"
                value={formData.noteAr || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteEn">English Note</Label>
              <Textarea
                id="noteEn"
                name="noteEn"
                value={formData.noteEn || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Chapter</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[40px] h-auto py-2 px-4"
                onClick={() => setIsChapterDialogOpen(true)}
              >
                <div className="flex w-full items-start gap-2">
                  <span className="flex-grow text-right whitespace-normal break-words leading-normal">
                    {selectedChapter
                      ? selectedChapter.nameAr
                      : "Choose Chapter"}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" />
                </div>
              </Button>
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

                {formData.agreements.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {formData.agreements.map((agreement) => {
                      const agreementName = getAgreementName(
                        agreement.agreementId._id
                      );
                      return (
                        <div
                          key={agreement.agreementId._id}
                          className="space-y-2 p-4 border rounded-md"
                        >
                          <div className="font-medium">{agreementName}</div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`dutyRate-${agreement.agreementId._id}`}
                            >
                              Reduced Duty Rate (%)
                            </Label>
                            <Input
                              id={`dutyRate-${agreement.agreementId._id}`}
                              type="number"
                              value={agreement.reducedDutyRate}
                              onChange={(e) =>
                                handleAgreementChange(
                                  agreement.agreementId._id,
                                  "reducedDutyRate",
                                  Number(e.target.value)
                                )
                              }
                              min="0"
                              max="100"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`global-${agreement.agreementId._id}`}
                              checked={agreement.applyGlobal}
                              onChange={(e) =>
                                handleAgreementChange(
                                  agreement.agreementId._id,
                                  "applyGlobal",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4"
                            />
                            <Label
                              htmlFor={`global-${agreement.agreementId._id}`}
                            >
                              Apply Globally
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* New Toggle for Product Schedule Tax Type */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="productScheduleTaxType"
                          name="productScheduleTaxType"
                          checked={formData.productScheduleTaxType === "nontraditional"}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="productScheduleTaxType">
                          Use Nontraditional Schedule Tax
                        </Label>
                      </div>
                      {/* Conditional Rendering of Schedule Taxes */}
{formData.productScheduleTaxType === "traditional" ? (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label>Schedule Taxes</Label>
      <Button 
        type="button" 
        onClick={handleAddScheduleTax} 
        variant="outline" 
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" /> Add
      </Button>
    </div>
    {formData.scheduleTaxes && formData.scheduleTaxes.length > 0 && (
      <div className="mt-4 space-y-4">
        {formData.scheduleTaxes.map((tax, index) => (
          <div
            key={index}
            className="space-y-3 p-4 border rounded-md relative"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => handleRemoveScheduleTax(index)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`min-${index}`}>Min Value</Label>
                <Input
                  id={`min-${index}`}
                  type="number"
                  value={tax.min}
                  onChange={(e) => handleScheduleTaxChange(index, 'min', Number(e.target.value))}
                  step="0.1"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`max-${index}`}>Max Value</Label>
                <Input
                  id={`max-${index}`}
                  type="number"
                  value={tax.max}
                  onChange={(e) => handleScheduleTaxChange(index, 'max', Number(e.target.value))}
                  step="0.1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-1">
                <Label htmlFor={`fee-${index}`}>Fee</Label>
                <Input
                  id={`fee-${index}`}
                  type="number"
                  value={tax.fee}
                  onChange={(e) => handleScheduleTaxChange(index, 'fee', Number(e.target.value))}
                  step="0.1"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`enhancementFee-${index}`}>Enhancement Fee</Label>
                <Input
                  id={`enhancementFee-${index}`}
                  type="number"
                  value={tax.enhancementFee}
                  onChange={(e) => handleScheduleTaxChange(index, 'enhancementFee', Number(e.target.value))}
                  step="0.1"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <div className="space-y-2">
    <Label>Flat Schedule Tax</Label>
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1">
        <Label htmlFor="flatScheduleTax-per">Per Value</Label>
        <Input
          id="flatScheduleTax-per"
          type="number"
          name="flatScheduleTax.per"
          value={formData.flatScheduleTax?.per || 0}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setFormData(prev => ({
              ...prev,
              flatScheduleTax: {
                ...prev.flatScheduleTax,
                per: newValue
              } as FlatScheduleTax
            }));
            updateChangedFields('flatScheduleTax', {
              ...formData.flatScheduleTax,
              per: newValue
            });
          }}
          step="0.1"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="flatScheduleTax-fee">Fee</Label>
        <Input
          id="flatScheduleTax-fee"
          type="number"
          name="flatScheduleTax.fee"
          value={formData.flatScheduleTax?.fee || 0}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setFormData(prev => ({
              ...prev,
              flatScheduleTax: {
                ...prev.flatScheduleTax,
                fee: newValue
              } as FlatScheduleTax
            }));
            updateChangedFields('flatScheduleTax', {
              ...formData.flatScheduleTax,
              fee: newValue
            });
          }}
          step="0.1"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="flatScheduleTax-enhancementFee">Enhancement Fee</Label>
        <Input
          id="flatScheduleTax-enhancementFee"
          type="number"
          name="flatScheduleTax.enhancementFee"
          value={formData.flatScheduleTax?.enhancementFee || 0}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setFormData(prev => ({
              ...prev,
              flatScheduleTax: {
                ...prev.flatScheduleTax,
                enhancementFee: newValue
              } as FlatScheduleTax
            }));
            updateChangedFields('flatScheduleTax', {
              ...formData.flatScheduleTax,
              enhancementFee: newValue
            });
          }}
          step="0.1"
          required
        />
      </div>
    </div>
  </div>
)}



            {/* <div className="space-y-2">
              <Label>Schedule Taxes</Label>
              <div className="space-y-4">
                {formData.scheduleTaxes?.map((tax, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Schedule Tax {index + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveScheduleTax(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`tax-min-${index}`}>Min</Label>
                        <Input
                          id={`tax-min-${index}`}
                          type="number"
                          value={tax.min}
                          onChange={(e) =>
                            handleScheduleTaxChange(
                              index,
                              "min",
                              Number(e.target.value)
                            )
                          }
                          step="0.1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tax-max-${index}`}>Max</Label>
                        <Input
                          id={`tax-max-${index}`}
                          type="number"
                          value={tax.max}
                          onChange={(e) =>
                            handleScheduleTaxChange(
                              index,
                              "max",
                              Number(e.target.value)
                            )
                          }
                          step="0.1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tax-fee-${index}`}>Fee</Label>
                        <Input
                          id={`tax-fee-${index}`}
                          type="number"
                          value={tax.fee}
                          onChange={(e) =>
                            handleScheduleTaxChange(
                              index,
                              "fee",
                              Number(e.target.value)
                            )
                          }
                          step="0.1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tax-enhancement-${index}`}>
                          Enhancement Fee
                        </Label>
                        <Input
                          id={`tax-enhancement-${index}`}
                          type="number"
                          value={tax.enhancementFee}
                          onChange={(e) =>
                            handleScheduleTaxChange(
                              index,
                              "enhancementFee",
                              Number(e.target.value)
                            )
                          }
                          step="0.1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddScheduleTax}
                >
                  Add Schedule Tax
                </Button>
              </div>
            </div> */}

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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || Object.keys(changedFields).length === 0}
              >
                {isLoading ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chapter Selection Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Select Chapter
              {!chaptersLoading &&
                chaptersData?.getChapters?.totalSize &&
                ` (${chaptersData.getChapters.totalSize} total)`}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {chaptersLoading ? (
              <div className="p-4 text-center">Loading chapters...</div>
            ) : (
              <>
                {chaptersData?.getChapters?.data.map((chapter: Chapter) => {
                  const isExpanded = expandedChapter === chapter._id;

                  return (
                    <div key={chapter._id} className="border-b last:border-b-0">
                      <div
                        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-secondary text-foreground dark:text-white"
                        onClick={() => {
                          if (isExpanded) {
                            handleChapterSelect(chapter, "chapter");
                          } else {
                            setExpandedChapter(chapter._id);
                          }
                        }}
                      >
                        <span className="font-medium text-right flex-grow group-hover:text-black dark:group-hover:text-white">
                          {chapter.nameAr}
                        </span>
                        <div className="group-hover:bg-gray-100 dark:group-hover:bg-gray-700 absolute inset-0 -z-10"></div>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {isExpanded && chapter.subChapters?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800">
                          {chapter.subChapters.map((subChapter) => (
                            <div
                              key={subChapter._id}
                              className="flex items-center py-2 px-6 border-t cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                              onClick={() =>
                                handleChapterSelect(subChapter, "subChapter")
                              }
                            >
                              <span className="text-right flex-grow">
                                {subChapter.nameAr}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {chaptersData?.getChapters?.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="dark:text-white">
                      Page {chaptersData.getChapters.pageNumber + 1} of{" "}
                      {chaptersData.getChapters.totalPages}
                    </span>
                    <Button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        currentPage >= chaptersData.getChapters.totalPages - 1
                      }
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setIsChapterDialogOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agreement Selection Dialog */}
      <Dialog
        open={isAgreementDialogOpen}
        onOpenChange={setIsAgreementDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Select Agreements
              {!agreementsLoading &&
                agreementsData?.AgreementList?.totalSize &&
                ` (${agreementsData.AgreementList.totalSize} total)`}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {agreementsLoading ? (
              <div className="p-4 text-center">Loading agreements...</div>
            ) : (
              <>
                {agreementsData?.AgreementList?.data.map(
                  (agreement: { _id: string; name: string }) => (
                    <div
                      key={agreement._id}
                      className="flex items-center space-x-2 py-2 border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        id={`agreement-${agreement._id}`}
                        checked={formData.agreements.some(
                          (a) => a.agreementId._id === agreement._id
                        )}
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

                {agreementsData?.AgreementList?.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span>
                      Page {agreementsData.AgreementList.pageNumber + 1} of{" "}
                      {agreementsData.AgreementList.totalPages}
                    </span>
                    <Button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        currentPage >=
                        agreementsData.AgreementList.totalPages - 1
                      }
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
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

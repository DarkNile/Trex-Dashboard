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
  HSCode: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  subChapterId: string;
  serviceTax: boolean;
  adVAT: number;
  type: "regural" | "car";
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

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  // const [formData, setFormData] = useState(productData);
  const [formData, setFormData] = useState<UpdateFormData>({
    ...productData,
    agreements: productData.agreements.map((agreement) => ({
      _id: agreement._id,
      agreementId: agreement.agreementId,
      reducedDutyRate: agreement.reducedDutyRate,
      applyGlobal: agreement.applyGlobal,
    })),
  });
  const [changedFields, setChangedFields] = useState<Partial<ProductData>>({});
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  // const { data: agreementsData } = useGenericQuery({ query: GET_AGREEMENTS });
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

  useEffect(() => {
    const hasAgreementsChanged = JSON.stringify(formData.agreements) !== JSON.stringify(productData.agreements);
    if (hasAgreementsChanged) {
      setChangedFields(prev => ({ ...prev, agreements: formData.agreements }));
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

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   //the first submit
  //   e.preventDefault();
  //   if (Object.keys(changedFields).length === 0) {
  //     toast("No changes detected");
  //     return;
  //   }

  //   const updateData = {
  //     id: productId,
  //     ...changedFields,
  //   };
  //   const agreementsString = formData.agreements
  //     .map(
  //       (agreement) =>
  //         `{agreementId:'${agreement.agreementId._id}',reducedDutyRate:${agreement.reducedDutyRate},applyGlobal:${agreement.applyGlobal}}`
  //     )
  //     .join(",");

  //   updateAgreements({
  //     addNewAgreementInput: {
  //       id: productId,
  //       agreements: agreementsString,
  //     },
  //   });

  //   // if (changedFields.agreements) {
  //   //   updateData.agreements = changedFields.agreements;
  //   // }

  //   if ("defaultDutyRate" in changedFields) {
  //     updateData.defaultDutyRate = Number(changedFields.defaultDutyRate);
  //   }

  //   if ("adVAT" in changedFields) {
  //     updateData.adVAT = Number(changedFields.adVAT);
  //   }

  //   updateProduct({
  //     updateProductInput: updateData,
  //   });
  // };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //the second submit
  //   e.preventDefault();

  //   try {
  //     // First, update the product details
  //     const productUpdateData = {
  //       id: productId,
  //       ...changedFields,
  //     };

  //     if ("defaultDutyRate" in changedFields) {
  //       productUpdateData.defaultDutyRate = Number(changedFields.defaultDutyRate);
  //     }

  //     if ("adVAT" in changedFields) {
  //       productUpdateData.adVAT = Number(changedFields.adVAT);
  //     }

  //     // Remove agreements from product update data as it will be handled separately
  //     delete productUpdateData.agreements;

  //     await updateProduct({
  //       updateProductInput: productUpdateData,
  //     });

  //     // Then, update the agreements
  // const agreementsString = formData.agreements
  //   .map(agreement => `{agreementId:'${agreement.agreementId._id}',reducedDutyRate:${agreement.reducedDutyRate},applyGlobal:${agreement.applyGlobal}}`)
  //   .join(',');

  // await updateAgreements({
  //   addNewAgreementInput: {
  //     id: productId,
  //     agreements: agreementsString
  //   }
  // });

  //     toast.success("Product and agreements updated successfully! ✅");
  //     onSuccess?.();
  //     onClose();
  //   } catch (error) {
  //     toast.error(`Error updating product:`);
  //   }
  // };

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
      // تحويل الاتفاقيات إلى النص المطلوب
      const agreementsString = changedFields.agreements
        .map(agreement => `{agreementId:'${agreement.agreementId._id}',reducedDutyRate:${agreement.reducedDutyRate},applyGlobal:${agreement.applyGlobal}}`)
        .join(',');
      
      // إرسال طلبين منفصلين: واحد للمنتج وواحد للاتفاقيات
      const productUpdateData = { ...updateData };
      delete productUpdateData.agreements;

      // تحديث المنتج أولاً
      updateProduct({
        updateProductInput: productUpdateData,
      }).then(() => {
        // ثم تحديث الاتفاقيات
        updateAgreements({
          addNewAgreementInput: {
            id: productId,
            agreements: agreementsString
          }
        }).then(() => {
          toast.success("Product and agreements updated successfully! ✅");
          onSuccess?.();
          onClose();
        }).catch((error) => {
          toast.error(`Error updating agreements: ${error.message}`);
        });
      }).catch((error) => {
        toast.error(`Error updating product: ${error.message}`);
      });
    } else {
      // إذا لم تكن هناك تغييرات في الاتفاقيات، قم بتحديث المنتج فقط
      updateProduct({
        updateProductInput: updateData,
      });
    }
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

  const handleAgreementToggle = (agreement: { _id: string; name: string }) => {
    setFormData((prev) => {
      const existingAgreementIndex = prev.agreements.findIndex(
        (a) => a.agreementId._id === agreement._id
      );

      let newAgreements;

      if (existingAgreementIndex !== -1) {
        newAgreements = [...prev.agreements];
        newAgreements.splice(existingAgreementIndex, 1);
        // return { ...prev, agreements: newAgreements };
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

      // return {
      //   ...prev,
      //   agreements: [
      //     ...prev.agreements,
      //     {
      //       agreementId: {
      //         _id: agreement._id,
      //         name: agreement.name
      //       },
      //       reducedDutyRate: 0,
      //       applyGlobal: true
      //     }
      //   ]
      // };

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

      // Update changedFields whenever an agreement is modified
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
                              htmlFor={`dutyRate-${agreement.agreementId}`}
                            >
                              Reduced Duty Rate (%)
                            </Label>
                            <Input
                              id={`dutyRate-${agreement.agreementId}`}
                              type="number"
                              value={agreement.reducedDutyRate}
                              // onChange={(e) => {
                              //   const newAgreements = formData.agreements.map(
                              //     (a) =>
                              //       a.agreementId === agreement.agreementId
                              //         ? {
                              //             ...a,
                              //             reducedDutyRate: Number(
                              //               e.target.value
                              //             ),
                              //           }
                              //         : a
                              //   );
                              //   setFormData((prev) => ({
                              //     ...prev,
                              //     agreements: newAgreements,
                              //   }));
                              // }}
                              onChange={(e) => handleAgreementChange(
                                agreement.agreementId._id,
                                'reducedDutyRate',
                                Number(e.target.value)
                              )}
                              min="0"
                              max="100"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`global-${agreement.agreementId}`}
                              checked={agreement.applyGlobal}
                              // onChange={(e) => {
                              //   const newAgreements = formData.agreements.map(
                              //     (a) =>
                              //       a.agreementId === agreement.agreementId
                              //         ? { ...a, applyGlobal: e.target.checked }
                              //         : a
                              //   );
                              //   setFormData((prev) => ({
                              //     ...prev,
                              //     agreements: newAgreements,
                              //   }));
                              // }}
                              onChange={(e) => handleAgreementChange(
                                agreement.agreementId._id,
                                'applyGlobal',
                                e.target.checked
                              )}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`global-${agreement.agreementId}`}>
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
      <Dialog
        open={isAgreementDialogOpen}
        onOpenChange={setIsAgreementDialogOpen}
      >
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

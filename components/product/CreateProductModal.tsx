import React, { useState } from "react";
import { Plus, ChevronDown, ChevronRight, X, ChevronLeft } from "lucide-react";
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
import Textarea from "../UI/textArea";
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
interface AgreementInput {
  agreementId: string;
  reducedDutyRate: number;
  applyGlobal: boolean;
}
interface ScheduleTax {
  min: number;
  max: number;
  fee: number;
  enhancementFee: number;
}
interface CreateFormData {
  HSCode: string;
  nameEn: string;
  nameAr: string;
  note: string;
  defaultDutyRate: number;
  subChapterId: string;
  agreements: AgreementInput[];
  serviceTax: boolean;
  adVAT: number;
  type: "regural" | "car";
  scheduleTaxes: ScheduleTax[];
}

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
  const [currentPage, setCurrentPage] = useState(0);
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  // const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<{
    id: string;
    nameAr: string;
    type: "chapter" | "subChapter";
  } | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  const [formData, setFormData] = useState<CreateFormData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    note: "",
    defaultDutyRate: 0,
    subChapterId: "",
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    type: "regural",
    scheduleTaxes: [],
  });
  const { data: chaptersData, loading: chaptersLoading } = useGenericQuery({
    query: GET_CHAPTERS,
    variables: {
      page: currentPage,
    },
    onError: (error) => {
      console.error("chapters loading error:", error);
      toast.error(`Error loading chapters: ${error.message}`);
    },
  });
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
  const { execute: createProduct, isLoading } = useGenericMutation({
    mutation: CREATE_PRODUCT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        HSCode: "",
        nameEn: "",
        nameAr: "",
        note: "",
        defaultDutyRate: 0,
        subChapterId: "",
        agreements: [],
        serviceTax: false,
        adVAT: 0,
        type: "regural",
        scheduleTaxes: [],
      });
      setSelectedChapter(null);
      toast.success("Product created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating product: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const createProductInput = {
      HSCode: formData.HSCode,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      note: formData.note,
      defaultDutyRate: Number(formData.defaultDutyRate),
      subChapterId: formData.subChapterId,
      agreements: formData.agreements.map(agreement => ({
        agreementId: agreement.agreementId,
        reducedDutyRate: Number(agreement.reducedDutyRate),
        applyGlobal: Boolean(agreement.applyGlobal)
      })),
      serviceTax: formData.serviceTax,
      adVAT: Number(formData.adVAT),
      type: formData.type,
      scheduleTaxes: formData.scheduleTaxes.map(tax => ({
        min: Number(tax.min),
        max: Number(tax.max),
        fee: Number(tax.fee),
        enhancementFee: Number(tax.enhancementFee)
      }))
    };

    console.log("Mutation Input:", {
      createProductInput: createProductInput,
    });
    createProduct({
      createProductInput: createProductInput,
    });
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    }
    setIsChapterDialogOpen(false);
  };
  const handleAgreementToggle = (agreement: { _id: string; name: string }) => {
    setFormData((prev) => {
      const existingAgreement = prev.agreements.find(
        (a) => a.agreementId === agreement._id
      );

      if (existingAgreement) {
        return {
          ...prev,
          agreements: prev.agreements.filter(
            (a) => a.agreementId !== agreement._id
          ),
        };
      }
      const newAgreement: AgreementInput = {
        agreementId: agreement._id,
        reducedDutyRate: 0,
        applyGlobal: true,
      };
      return {
        ...prev,
        agreements: [...prev.agreements, newAgreement],
      };
    });
  };
  const getAgreementName = (id: string) => {
    return (
      agreementsData?.AgreementList?.data.find(
        (agreement: { _id: string; name: string }) => agreement._id === id
      )?.name || ""
    );
  };

  const addScheduleTax = () => {
    setFormData((prev) => ({
      ...prev,
      scheduleTaxes: [
        ...prev.scheduleTaxes,
        { min: 0, max: 0, fee: 0, enhancementFee: 0 },
      ],
    }));
  };

  const removeScheduleTax = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scheduleTaxes: prev.scheduleTaxes.filter((_, i) => i !== index),
    }));
  };

  const updateScheduleTax = (index: number, field: keyof ScheduleTax, value: number) => {
    setFormData((prev) => {
      const updatedTaxes = [...prev.scheduleTaxes];
      updatedTaxes[index] = {
        ...updatedTaxes[index],
        [field]: value,
      };
      return {
        ...prev,
        scheduleTaxes: updatedTaxes,
      };
    });
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
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
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
            {/* Agreements Section */}
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
                        agreement.agreementId
                      );
                      return (
                        <div
                          key={agreement.agreementId}
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
                              onChange={(e) => {
                                const newAgreements = formData.agreements.map(
                                  (a) =>
                                    a.agreementId === agreement.agreementId
                                      ? {
                                          ...a,
                                          reducedDutyRate: Number(
                                            e.target.value
                                          ),
                                        }
                                      : a
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  agreements: newAgreements,
                                }));
                              }}
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
                              onChange={(e) => {
                                const newAgreements = formData.agreements.map(
                                  (a) =>
                                    a.agreementId === agreement.agreementId
                                      ? { ...a, applyGlobal: e.target.checked }
                                      : a
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  agreements: newAgreements,
                                }));
                              }}
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
            
            {/* Schedule Taxes Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Schedule Taxes</Label>
                <Button 
                  type="button" 
                  onClick={addScheduleTax} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              {formData.scheduleTaxes.length > 0 && (
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
                        onClick={() => removeScheduleTax(index)}
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
                            onChange={(e) => updateScheduleTax(index, 'min', Number(e.target.value))}
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
                            onChange={(e) => updateScheduleTax(index, 'max', Number(e.target.value))}
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
                            onChange={(e) => updateScheduleTax(index, 'fee', Number(e.target.value))}
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
                            onChange={(e) => updateScheduleTax(index, 'enhancementFee', Number(e.target.value))}
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
                        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (isExpanded) {
                            handleChapterSelect(chapter, "chapter");
                          } else {
                            setExpandedChapter(chapter._id);
                          }
                        }}
                      >
                        <span className="font-medium text-right flex-grow">
                          {chapter.nameAr}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {isExpanded && chapter.subChapters?.length > 0 && (
                        <div className="bg-gray-50">
                          {chapter.subChapters.map((subChapter) => (
                            <div
                              key={subChapter._id}
                              className="flex items-center py-2 px-6 border-t cursor-pointer hover:bg-gray-100"
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
                    <span>
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
                          (a) => a.agreementId === agreement._id
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
export default CreateProductModal;

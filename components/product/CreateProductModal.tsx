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

interface AgreementInput {
  agreementId: string;
  reducedDutyRate: number;
  applyGlobal: boolean;
}

interface CreateFormData {
  HSCode: string;
  nameEn: string;
  nameAr: string;
  note: string;
  defaultDutyRate: number;
  subChapterId: string;
  agreements: Array<{
    agreementId: string;
    reducedDutyRate: number;
    applyGlobal: boolean;
  }>;
  serviceTax: boolean;
  adVAT: number;
  type: "regural" | "car";
}

// // GraphQL Queries
// const GET_CHAPTERS = gql`
//   query GetChapters {
//     getChapters(extraFilter: { deleted: false }, pageable: { page: 1 }) {
//       data {
//         _id
//         nameEn
//         nameAr
//         subChapters {
//           _id
//           nameEn
//           nameAr
//         }
//       }
//     }
//   }
// `;

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

// const GET_AGREEMENTS = gql`
//   query GetAgreements {
//     AgreementList(filter: { deleted: false }, pageable: { page: 1 }) {
//       data {
//         _id
//         name
//       }
//     }
//   }
// `;

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
  });

  // const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
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

    const agreementsString = formData.agreements
      .map(
        (agreement) =>
          `{agreementId:"${agreement.agreementId}",reducedDutyRate:${agreement.reducedDutyRate},applyGlobal:${agreement.applyGlobal}}`
      )
      .join(",");

    const createProductInput = {
      HSCode: formData.HSCode,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      note: formData.note,
      defaultDutyRate: Number(formData.defaultDutyRate),
      subChapterId: formData.subChapterId,
      agreements: agreementsString, // Send as a string
      serviceTax: formData.serviceTax,
      adVAT: Number(formData.adVAT),
      type: "regural",
    };

    console.log("Mutation Input:", {
      createProductInput: createProductInput,
    });

    // Send the mutation
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

  // const handleChapterSelect = (chapter: Chapter) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     subChapterId: chapter._id,
  //   }));
  //   setSelectedName(chapter.nameAr);
  //   setIsChapterDropdownOpen(false);
  // };

  // const handleSubChapterSelect = (subChapter: SubChapter) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     subChapterId: subChapter._id,
  //   }));
  //   setSelectedName(subChapter.nameAr);
  //   setIsChapterDropdownOpen(false);
  // };

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
        reducedDutyRate: 0, // Default value, can be modified
        applyGlobal: true, // Default value, can be modified
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

  // const AgreementRateInput: React.FC<{
  //   agreement: AgreementInput;
  //   onChange: (agreement: AgreementInput) => void;
  // }> = ({ agreement, onChange }) => {
  //   return (
  //     <div className="flex items-center gap-2 mt-2">
  //       <Input
  //         type="number"
  //         value={agreement.reducedDutyRate}
  //         onChange={(e) =>
  //           onChange({
  //             ...agreement,
  //             reducedDutyRate: Number(e.target.value),
  //           })
  //         }
  //         placeholder="Reduced Rate %"
  //         className="w-32"
  //       />
  //       <label className="flex items-center gap-2">
  //         <input
  //           type="checkbox"
  //           checked={agreement.applyGlobal}
  //           onChange={(e) =>
  //             onChange({
  //               ...agreement,
  //               applyGlobal: e.target.checked,
  //             })
  //           }
  //           className="w-4 h-4"
  //         />
  //         <span className="text-sm">Apply Global</span>
  //       </label>
  //     </div>
  //   );
  // };

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

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
              />
            </div>

            {/* Custom Chapter Dropdown */}
            {/* <div className="space-y-2">
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
            </div> */}

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

      {/* Chapter Selection Dialog */}
      {/* <Dialog
        open={isChapterDialogOpen}
        onOpenChange={setIsChapterDialogOpen}
      >
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
                        onClick={() => setExpandedChapter(isExpanded ? null : chapter._id)}
                      >
                        <span className="font-medium text-right flex-grow">{chapter.nameAr}</span>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      
                      {isExpanded && chapter.subChapters?.length > 0 && (
                        <div className="bg-gray-50">
                          {chapter.subChapters.map((subChapter) => (
                            <div
                              key={subChapter._id}
                              className="flex items-center py-2 px-6 border-t cursor-pointer hover:bg-gray-100"
                              onClick={() => handleChapterSelect(subChapter, 'subChapter')}
                            >
                              <span className="text-right flex-grow">{subChapter.nameAr}</span>
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
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
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
                      disabled={currentPage >= chaptersData.getChapters.totalPages - 1}
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
              onClick={() => setIsChapterDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

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
                        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (isExpanded) {
                            // If already expanded, select the chapter
                            handleChapterSelect(chapter, "chapter");
                          } else {
                            // If not expanded, expand it
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

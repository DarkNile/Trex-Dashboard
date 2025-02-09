import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Plus } from "lucide-react";
import Select, { StylesConfig } from "react-select";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";

// Interface definitions
interface CreateMeasurementModalProps {
  onSuccess?: () => void;
}

interface FormData {
  unitName: string;
  chapterIds: string[];
  subChapterIds: string[];
  productIds: string[];
}

interface SelectOption {
  value: string;
  label: string;
}

interface Chapter {
  _id: string;
  nameEn: string;
  nameAr: string;
}

interface SubChapter {
  _id: string;
  nameEn: string;
  nameAr: string;
}

interface Product {
  _id: string;
  nameEn: string;
  HSCode: string;
  nameAr?: string;
}

interface CreateMeasurementInput {
  unitName?: string;
  chapterIds?: string;
  subChapterIds?: string;
  productIds?: string;
}

// GraphQL queries
const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(extraFilter: { deleted: false }) {
      data {
        _id
        nameEn
        nameAr
      }
    }
  }
`;

const GET_SUBCHAPTERS = gql`
  query GetSubChaptersList {
    getSubChaptersList(extraFilter: { deleted: false }) {
      data {
        _id
        nameEn
        nameAr
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query AllProducts {
    allProducts {
      data {
        _id
        HSCode
        nameEn
        nameAr
      }
    }
  }
`;

const CREATE_MEASUREMENT = gql`
  mutation CreateMeasurement($createMeasurementInput: CreateMeasurementInput!) {
    createMeasurement(createMeasurementInput: $createMeasurementInput)
  }
`;

const CreateMeasurementModal: React.FC<CreateMeasurementModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    unitName: "",
    chapterIds: [],
    subChapterIds: [],
    productIds: [],
  });

  // Query hooks with type definitions
  const { data: chaptersData } = useGenericQuery<{
    getChapters: { data: Chapter[] };
  }>({
    query: GET_CHAPTERS,
  });

  const { data: subChaptersData } = useGenericQuery<{
    getSubChaptersList: { data: SubChapter[] };
  }>({
    query: GET_SUBCHAPTERS,
  });

  const { data: productsData } = useGenericQuery<{
    allProducts: { data: Product[] };
  }>({
    query: GET_PRODUCTS,
  });

  const { execute: createMeasurement, isLoading } = useGenericMutation<
    { createMeasurement: boolean },
    { createMeasurementInput: CreateMeasurementInput }
  >({
    mutation: CREATE_MEASUREMENT,
    onSuccess: () => {
      toast.success("Measurement created successfully!");
      setOpen(false);
      setFormData({
        unitName: "",
        chapterIds: [],
        subChapterIds: [],
        productIds: [],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating measurement: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create base input with required unitName
    const createMeasurementInput: Partial<CreateMeasurementInput> = {
      unitName: formData.unitName,
    };

    // Only add arrays if they have items
    if (formData.chapterIds.length > 0) {
      createMeasurementInput.chapterIds = formData.chapterIds.join(",");
    }

    if (formData.subChapterIds.length > 0) {
      createMeasurementInput.subChapterIds = formData.subChapterIds.join(",");
    }

    if (formData.productIds.length > 0) {
      createMeasurementInput.productIds = formData.productIds.join(",");
    }

    const variables = {
      createMeasurementInput,
    };

    try {
      await createMeasurement(variables);
    } catch (error) {
      console.error("Error creating measurement:", error);
    }
  };

  // Transform data for react-select with proper typing
  const chapterOptions: SelectOption[] =
    chaptersData?.getChapters?.data.map((chapter) => ({
      value: chapter._id,
      label: `${chapter.nameEn} - ${chapter.nameAr}`,
    })) || [];

  const subChapterOptions: SelectOption[] =
    subChaptersData?.getSubChaptersList?.data.map((subChapter) => ({
      value: subChapter._id,
      label: `${subChapter.nameEn} - ${subChapter.nameAr}`,
    })) || [];

  const productOptions: SelectOption[] =
    productsData?.allProducts?.data.map((product) => ({
      value: product._id,
      label: `${product.nameEn} - ${product.HSCode}`,
    })) || [];

  // Custom styles with proper typing
  const selectStyles: StylesConfig<SelectOption, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: "white",
      borderColor: "#e2e8f0",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0f172a"
        : state.isFocused
        ? "#f1f5f9"
        : "white",
      "&:active": {
        backgroundColor: "#e2e8f0",
      },
    }),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Measurement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Create New Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitName">Unit Name</Label>
            <Input
              id="unitName"
              value={formData.unitName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, unitName: e.target.value }))
              }
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Chapters</Label>
            <Select<SelectOption, true>
              isMulti
              options={chapterOptions}
              styles={selectStyles}
              className="w-[950px]"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  chapterIds: selected?.map((option) => option.value) || [],
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>SubChapters</Label>
            <Select<SelectOption, true>
              isMulti
              options={subChapterOptions}
              styles={selectStyles}
              className="w-[950px]"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  subChapterIds: selected?.map((option) => option.value) || [],
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Products</Label>
            <Select<SelectOption, true>
              isMulti
              options={productOptions}
              styles={selectStyles}
              className="w-[950px]"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  productIds: selected?.map((option) => option.value) || [],
                }))
              }
            />
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

export default CreateMeasurementModal;

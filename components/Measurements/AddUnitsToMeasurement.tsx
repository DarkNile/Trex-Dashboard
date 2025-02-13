import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";
import Select, { StylesConfig } from "react-select";

// Interface definitions
interface SelectOption {
  value: string;
  label: string;
}

interface AddUnitsToMeasurementProps {
  selectedMeasurement: {
    _id: string;
    unitName: string;
  };
  onSuccess?: () => void;
  onClose: () => void;
}

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

const ADD_UNITS_TO_MEASUREMENT = gql`
  mutation AddUnitsToMeasurement(
    $updateMeasurementInput: addChapterOrSubChapterOrItemsToMeasurementInput!
  ) {
    addUnitsToMeasurement(updateMeasurementInput: $updateMeasurementInput)
  }
`;

const AddUnitsToMeasurement: React.FC<AddUnitsToMeasurementProps> = ({
  selectedMeasurement,
  onSuccess,
  onClose,
}) => {
  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState({
    chapterIds: [] as string[],
    subChapterIds: [] as string[],
    productIds: [] as string[],
  });

  // Fetch data
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
  const { data: subChaptersData } = useGenericQuery({ query: GET_SUBCHAPTERS });
  const { data: productsData } = useGenericQuery({ query: GET_PRODUCTS });

  // Custom styles for react-select
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

  // Transform data for react-select
  const chapterOptions: SelectOption[] =
    chaptersData?.getChapters?.data.map((chapter: any) => ({
      value: chapter._id,
      label: `${chapter.nameEn} - ${chapter.nameAr}`,
    })) || [];

  const subChapterOptions: SelectOption[] =
    subChaptersData?.getSubChaptersList?.data.map((subChapter: any) => ({
      value: subChapter._id,
      label: `${subChapter.nameEn} - ${subChapter.nameAr}`,
    })) || [];

  const productOptions: SelectOption[] =
    productsData?.allProducts?.data.map((product: any) => ({
      value: product._id,
      label: `${product.nameEn} - ${product.HSCode}`,
    })) || [];

  // Mutation for adding units to measurement
  const { execute: addUnitsToMeasurement, isLoading } = useGenericMutation({
    mutation: ADD_UNITS_TO_MEASUREMENT,
    onSuccess: () => {
      toast.success("Units added to measurement successfully!");
      handleClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error adding units to measurement: ${error.message}`);
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open, onClose]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const variables = {
      updateMeasurementInput: {
        id: selectedMeasurement._id,
        chapterIds: formData.chapterIds.join(",") || null,
        subChapterIds: formData.subChapterIds.join(",") || null,
        productIds: formData.productIds.join(",") || null,
      },
    };

    try {
      await addUnitsToMeasurement(variables);
    } catch (error) {
      console.error("Error adding units to measurement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Add Units to {selectedMeasurement.unitName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Units"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitsToMeasurement;

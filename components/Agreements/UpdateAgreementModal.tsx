import React, { useEffect, useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { ChevronDown, X } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const UPDATE_AGREEMENT = gql`
  mutation UpdateAgreement($updateAgreementInput: UpdateAgreementInput!) {
    updateAgreement(updateAgreementInput: $updateAgreementInput) {
      _id
      name
      note
<<<<<<< HEAD
      reducedDutyRate
=======
>>>>>>> mahmoudBadr
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
<<<<<<< HEAD
    countryList(pageable: { page: $page }) {
      data {
        _id
        nameEn
=======
    countryList(pageable: { page: $page }, extraFilter: { deleted: false }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        nameEn
        nameAr
        code
>>>>>>> mahmoudBadr
      }
    }
  }
`;

interface UpdateAgreementModalProps {
  agreementId: string;
  initialData: {
    name: string;
    countryIds: string;
    note: string;
  };
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateAgreementModal: React.FC<UpdateAgreementModalProps> = ({
  agreementId,
  initialData,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    selectedCountries: [] as Array<{ _id: string; nameEn: string }>,
    note: initialData?.note || "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedCountries, setLoadedCountries] = useState<
    Array<{ _id: string; nameEn: string }>
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(
    initialData?.countryIds
      ? initialData.countryIds.split(",").filter(Boolean)
      : []
  );

  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: currentPage },
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || "",
        note: initialData.note || "",
      }));
      setSelectedCountryIds(
        initialData.countryIds
          ? initialData.countryIds.split(",").filter(Boolean)
          : []
      );
    }
  }, [initialData]);

  // Handle countries data loading and initial selection
  useEffect(() => {
    if (countriesData?.countryList?.data) {
      const newCountries = countriesData.countryList.data.filter(
        (newCountry: { _id: string }) =>
          !loadedCountries.some(
            (prevCountry) => prevCountry._id === newCountry._id
          )
      );

      setLoadedCountries((prev) => [...prev, ...newCountries]);
      setHasMore(newCountries.length > 0);

      // Match selected countries with loaded ones
      const matchedCountries = newCountries.filter((country: { _id: string }) =>
        selectedCountryIds.includes(country._id)
      );

      if (matchedCountries.length > 0) {
        setFormData((prev) => ({
          ...prev,
          selectedCountries: [
            ...prev.selectedCountries,
            ...matchedCountries,
          ].filter(
            (country, index, self) =>
              index === self.findIndex((c) => c._id === country._id)
          ),
        }));
      }

      // If we haven't found all selected countries and there might be more, load next page
      if (
        selectedCountryIds.length > formData.selectedCountries.length &&
        newCountries.length > 0
      ) {
        setCurrentPage((prev) => prev + 1);
      }
    }
  }, [countriesData, selectedCountryIds]);

  const { execute: updateAgreement, isLoading } = useGenericMutation({
    mutation: UPDATE_AGREEMENT,
    onSuccess: () => {
      toast.success("Agreement updated successfully! ✅");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating agreement:", error);
      toast.error(error.message || "Failed to update agreement", {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.selectedCountries.length ||
      !formData.note
    ) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    updateAgreement({
      updateAgreementInput: {
        id: agreementId,
        name: formData.name,
        countryIds: formData.selectedCountries.map((c) => c._id).join(","),
        note: formData.note,
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (country: { _id: string; nameEn: string }) => {
    if (country && country._id) {
      setFormData((prev) => ({
        ...prev,
        selectedCountries: [...prev.selectedCountries, country],
      }));
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveCountry = (countryId: string) => {
    if (countryId) {
      setFormData((prev) => ({
        ...prev,
        selectedCountries: prev.selectedCountries.filter(
          (c) => c._id !== countryId
        ),
      }));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMore && !loadingCountries) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (!agreementId) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter agreement name"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Countries</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingCountries}
              >
                {formData.selectedCountries.length
                  ? `${formData.selectedCountries.length} countries selected`
                  : "Select countries"}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-input bg-background rounded-md shadow-lg"
                  onScroll={handleScroll}
                >
                  {loadedCountries
                    .filter(
                      (country) =>
                        !formData.selectedCountries.some(
                          (sc) => sc._id === country._id
                        )
                    )
                    .map((country) => (
                      <div
                        key={country._id}
                        onClick={() => handleCountrySelect(country)}
                        className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {country.nameEn}
                      </div>
                    ))}
                  {loadingCountries && (
                    <div className="px-3 py-2 text-muted-foreground">
                      Loading more countries...
                    </div>
                  )}
                  {!hasMore && loadedCountries.length > 0 && (
                    <div className="px-3 py-2 text-muted-foreground">
                      No more countries
                    </div>
                  )}
                  {!loadingCountries && loadedCountries.length === 0 && (
                    <div className="px-3 py-2 text-muted-foreground">
                      No countries available
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.selectedCountries.map((country) => (
                <div
                  key={country._id}
                  className="flex items-center gap-1 bg-accent px-2 py-1 rounded-md"
                >
                  <span>{country.nameEn}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCountry(country._id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              required
              placeholder="Enter note"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Agreement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAgreementModal;

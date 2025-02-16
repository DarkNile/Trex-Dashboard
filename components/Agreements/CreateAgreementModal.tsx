import React, { useEffect, useState } from "react";
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
import { ChevronDown, Plus, X } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const CREATE_AGREEMENT = gql`
  mutation CreateAgreement($createAgreementDTO: CreateAgreementDTO!) {
    createAgreement(createAgreementDTO: $createAgreementDTO)
  }
`;

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
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
      }
    }
  }
`;

interface CreateAgreementModalProps {
  onSuccess?: () => void;
}

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    selectedCountries: [] as Array<{ _id: string; nameEn: string }>,
    note: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadedCountries, setLoadedCountries] = useState<
    Array<{ _id: string; nameEn: string }>
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: currentPage },
  });

  useEffect(() => {
    if (countriesData?.countryList?.data) {
      setLoadedCountries((prev) => {
        const newCountries = countriesData.countryList.data.filter(
          (newCountry: { _id: string }) =>
            !prev.some((prevCountry) => prevCountry._id === newCountry._id)
        );
        return [...prev, ...newCountries];
      });
      setHasMore(countriesData.countryList.data.length > 0);
    }
  }, [countriesData]);

  useEffect(() => {
    if (!open) {
      setCurrentPage(1);
      setLoadedCountries([]);
      setHasMore(true);
    }
  }, [open]);

  const { execute: createAgreement, isLoading } = useGenericMutation({
    mutation: CREATE_AGREEMENT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        name: "",
        selectedCountries: [],
        note: "",
      });
      toast.success("Agreement created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      console.log("Error creating agreement:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createAgreement({
      createAgreementDTO: {
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
    setFormData((prev) => ({
      ...prev,
      selectedCountries: [...prev.selectedCountries, country],
    }));
    setIsDropdownOpen(false);
  };

  const handleRemoveCountry = (countryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCountries: prev.selectedCountries.filter(
        (c) => c._id !== countryId
      ),
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMore && !loadingCountries) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Agreement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              required
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
                Select countries
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
                  {!hasMore && (
                    <div className="px-3 py-2 text-muted-foreground">
                      No more countries
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
              placeholder="Enter note"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Agreement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgreementModal;

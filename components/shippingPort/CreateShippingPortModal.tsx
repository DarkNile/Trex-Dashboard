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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { ChevronDown, Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const CREATE_SHIPPING_PORT = gql`
  mutation CreateShippingPort(
    $createShippingPortInput: CreateShippingPortDTO!
  ) {
    createShippingPort(createShippingPortInput: $createShippingPortInput)
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

interface CreateShippingPortModalProps {
  refetch: () => void;
}

const portTypes = [
  { value: "seaport", label: "Sea Port" },
  { value: "airport", label: "Air Port" },
  { value: "landPort", label: "Land Port" },
];

const CreateShippingPortModal: React.FC<CreateShippingPortModalProps> = ({
  refetch,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    port: "",
    countryId: "",
  });
  const [hasMore, setHasMore] = useState(true);
  const [loadedCountries, setLoadedCountries] = useState<
    Array<{ _id: string; nameEn: string }>
  >([]);
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMore && !loadingCountries) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const { execute: createShippingPort, isLoading } = useGenericMutation({
    mutation: CREATE_SHIPPING_PORT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        nameEn: "",
        nameAr: "",
        port: "",
        countryId: "",
      });
      toast.success("Shipping port created successfully! ✅");
      refetch(); // Using the refetch prop instead of onSuccess
    },
    onError: (error) => {
      console.log("Error creating shipping port:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createShippingPort({
      createShippingPortInput: formData,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Shipping Port
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shipping Port</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameEn">English Name</Label>
            <Input
              id="nameEn"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              placeholder="Enter English name"
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
              placeholder="Enter Arabic name"
              required
              className="font-arabic"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex relative h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingCountries}
              >
                {formData.countryId
                  ? loadedCountries.find((c) => c._id === formData.countryId)
                      ?.nameEn
                  : "Select country"}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50 absolute right-2" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-input bg-background rounded-md shadow-lg"
                  onScroll={handleScroll}
                >
                  {loadedCountries.map((country) => (
                    <div
                      key={country._id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          countryId: country._id,
                        }));
                        setIsDropdownOpen(false);
                      }}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port Type</Label>
            <Select
              value={formData.port}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, port: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select port type" />
              </SelectTrigger>
              <SelectContent>
                {portTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="countryId">Country</Label>
            <Select
              value={formData.countryId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, countryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countriesData?.countryList?.data.map((country: any) => (
                  <SelectItem key={country._id} value={country._id}>
                    {country.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Shipping Port"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShippingPortModal;

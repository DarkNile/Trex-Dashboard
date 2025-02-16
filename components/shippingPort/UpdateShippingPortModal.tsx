import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";
import { ShippingPortFromAPI } from "@/types/shipping";

const UPDATE_SHIPPING_PORT = gql`
  mutation UpdateShippingPortResponse(
    $updateShippingPortResponseInput: UpdateShippingPortInput!
  ) {
    updateShippingPortResponse(
      updateShippingPortResponseInput: $updateShippingPortResponseInput
    ) {
      _id
      nameAr
      nameEn
    }
  }
`;

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
    countryList(pageable: { page: $page }, extraFilter: { deleted: false }) {
      data {
        _id
        nameEn
      }
    }
  }
`;

interface UpdateShippingPortModalProps {
  refetch: () => void;
  shippingPort: ShippingPortFromAPI;
  onClose: () => void;
}

const portTypes = [
  { value: "seaport", label: "Sea Port" },
  { value: "airport", label: "Air Port" },
  { value: "landPort", label: "Land Port" },
];

const UpdateShippingPortModal: React.FC<UpdateShippingPortModalProps> = ({
  refetch,
  shippingPort,
  onClose,
}) => {
  const [currentPage] = useState(1);
  const [formData, setFormData] = useState({
    nameEn: shippingPort.nameEn || "",
    nameAr: shippingPort.nameAr || "",
    port: shippingPort.port || "",
    countryId: shippingPort.countryId?._id || "",
    id: shippingPort._id,
  });

  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: currentPage },
  });

  const { execute: updateShippingPort, isLoading } = useGenericMutation({
    mutation: UPDATE_SHIPPING_PORT,
    onSuccess: () => {
      onClose();
      toast.success("Shipping port updated successfully! ✅");
      refetch();
    },
    onError: (error) => {
      console.log("Error updating shipping port:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateShippingPort({
      updateShippingPortResponseInput: formData,
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Shipping Port</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameEn" className="text-right">
              Name (En)
            </Label>
            <Input
              id="nameEn"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameAr" className="text-right">
              Name (Ar)
            </Label>
            <Input
              id="nameAr"
              name="nameAr"
              value={formData.nameAr}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right">
              Port Type
            </Label>
            <Select
              value={formData.port}
              onValueChange={(value) => handleSelectChange("port", value)}
            >
              <SelectTrigger className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="countryId" className="text-right">
              Country
            </Label>
            <Select
              value={formData.countryId}
              onValueChange={(value) => handleSelectChange("countryId", value)}
            >
              <SelectTrigger className="col-span-3">
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
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateShippingPortModal;
